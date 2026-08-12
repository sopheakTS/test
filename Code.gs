const CONFIG = {
  SPREADSHEET_ID: '1iXLoDPlNtwBr-jfIR8Nd73dxarb9kfv5o3r3MCRCqIo',
  TIMEZONE: 'Asia/Phnom_Penh',
  LOW_STOCK: 10
};

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'health';
  try {
    if (action === 'health') return json_({success:true, message:'DADING API is running'});
    if (action === 'products') return json_({success:true, products:getProducts_()});
    if (action === 'customers') return json_({success:true, customers:getCustomers_()});
    if (action === 'reports') return json_({success:true, reports:getReports_()});
    return json_({success:false,message:'Unknown action'});
  } catch(err) { return json_({success:false,message:String(err)}); }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    switch (data.action) {
      case 'getProducts': return json_({success:true,products:getProducts_()});
      case 'getCustomers': return json_({success:true,customers:getCustomers_()});
      case 'getReports': return json_({success:true,reports:getReports_()});
      case 'saveCustomer': saveCustomer_(data); return json_({success:true});
      case 'saveProduct': saveProduct_(data); return json_({success:true});
      case 'saveInvoice': return json_(saveInvoice_(data));
      default: return json_({success:false,message:'Unknown action: '+data.action});
    }
  } catch(err) { return json_({success:false,message:String(err)}); }
}

function ss_(){return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);}
function sh_(name){return ss_().getSheetByName(name);}
function money_(v){return typeof v==='number'?v:parseFloat(String(v??'').replace(/[^0-9.-]/g,''))||0;}
function date_(v){return v instanceof Date?Utilities.formatDate(v,CONFIG.TIMEZONE,'yyyy-MM-dd HH:mm'):String(v||'');}

function getProducts_(){
  const s=sh_('Sheet1'); if(!s||s.getLastRow()<2)return [];
  return s.getRange(2,1,s.getLastRow()-1,15).getValues().map((r,i)=>{
    if(!r[0]&&!r[1])return null;
    return {row:i+2,name:String(r[0]||''),code:String(r[1]||''),variant:String(r[2]||''),
      price:money_(r[3]),category:String(r[5]||''),photo:String(r[10]||''),stock:Number(r[12])||0,
      updateDate:date_(r[13]),cost:money_(r[14])};
  }).filter(Boolean);
}

function getCustomers_(){
  const s=sh_('Customers'); if(!s||s.getLastRow()<2)return [];
  return s.getRange(2,1,s.getLastRow()-1,3).getValues().filter(r=>r[0]).map(r=>({name:String(r[0]),phone:String(r[1]||''),address:String(r[2]||'')}));
}

function nextInvoice_(){
  const s=sh_('Invoices'); let max=1000;
  if(s&&s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,1).getValues().forEach(r=>{const m=String(r[0]||'').match(/\d+/);if(m)max=Math.max(max,+m[0]);});
  return 'INV-'+(max+1);
}

function saveCustomer_(d){
  if(!d.name || d.name==='អតិថិជនទូទៅ')return;
  const s=sh_('Customers'); const rows=s.getLastRow()>1?s.getRange(2,1,s.getLastRow()-1,3).getValues():[];
  const i=rows.findIndex(r=>String(r[0]).trim()===String(d.name).trim() || (d.phone&&String(r[1]).trim()===String(d.phone).trim()));
  const row=[d.name,d.phone||'',d.address||''];
  if(i>=0)s.getRange(i+2,1,1,3).setValues([row]);else s.appendRow(row);
}

function saveProduct_(d){
  const s=sh_('Sheet1'), row=Number(d.rowIndex)||0, today=Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'dd/MM/yyyy');
  if(row>=2){
    s.getRange(row,1,1,15).setValues([[
      d.name||'',d.code||'',d.variant||'',Number(d.price)||0,'',d.category||'','','','','',d.photo||'',
      '',Number(d.stock)||0,today,Number(d.cost)||0
    ]]);
  } else {
    const a=Array(15).fill('');a[0]=d.name||'';a[1]=d.code||'';a[2]=d.variant||'';a[3]=Number(d.price)||0;a[5]=d.category||'';a[10]=d.photo||'';a[12]=Number(d.stock)||0;a[13]=today;a[14]=Number(d.cost)||0;s.appendRow(a);
  }
}

function saveInvoice_(d){
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const inv=sh_('Invoices'), det=sh_('InvoiceDetails'), ps=sh_('Sheet1');
    const items=d.items||[];if(!items.length)throw Error('សូមបន្ថែមទំនិញ');
    const products=getProducts_();
    items.forEach(it=>{const p=products.find(x=>x.code===String(it.code)||x.name===String(it.description));if(!p)throw Error('រកមិនឃើញ '+it.description);if(p.stock<Number(it.quantity))throw Error('ស្តុកមិនគ្រប់: '+p.name);});
    const no=d.invoiceNo||nextInvoice_(), dt=d.date||new Date(), total=Number(d.grandTotalUSD)||0;
    inv.appendRow([no,dt,d.clientName||'អតិថិជនទូទៅ',d.clientPhone||'',d.salesman||'',total,Number(d.discount)||0,Number(d.shipping)||0,d.paymentStatus||'Pending']);
    const rows=[];
    items.forEach(it=>{
      const q=Number(it.quantity)||0;rows.push([no,dt,it.code||'',it.description||'',q,Number(it.total)||Number(it.price)*q]);
      const p=products.find(x=>x.code===String(it.code)||x.name===String(it.description));
      if(p){const current=Number(ps.getRange(p.rowIndex,13).getValue())||0;ps.getRange(p.rowIndex,13).setValue(current-q);ps.getRange(p.rowIndex,14).setValue(Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'dd/MM/yyyy'));}
    });
    det.getRange(det.getLastRow()+1,1,rows.length,6).setValues(rows);saveCustomer_(d);
    return {success:true,invoiceNo:no};
  }finally{lock.releaseLock();}
}

function getReports_(){
  const inv=sh_('Invoices'),det=sh_('InvoiceDetails'),products=getProducts_(),out=[];
  if(!inv||inv.getLastRow()<2)return {invoices:[],products,lowStock:products.filter(p=>p.stock<=CONFIG.LOW_STOCK)};
  const rows=inv.getRange(2,1,inv.getLastRow()-1,9).getValues();
  const dr=det&&det.getLastRow()>1?det.getRange(2,1,det.getLastRow()-1,6).getValues():[];
  const map={};dr.forEach(r=>{if(r[0])(map[r[0]]??=[]).push({code:String(r[2]||''),description:String(r[3]||''),quantity:Number(r[4])||0,total:money_(r[5])});});
  const costs={};products.forEach(p=>{costs[p.code]=p.cost;costs[p.name]=p.cost;});
  rows.filter(r=>r[0]).forEach(r=>{const no=String(r[0]);const items=map[no]||[];const cost=items.reduce((s,x)=>s+(costs[x.code]??costs[x.description]??0)*x.quantity,0);
    out.push({invoiceNo:no,date:date_(r[1]),clientName:r[2]||'',phone:r[3]||'',salesman:r[4]||'',total:money_(r[5]),discount:money_(r[6]),shipping:money_(r[7]),status:r[8]||'',cost,profit:money_(r[5])-cost,items});
  });
  return {invoices:out,products,lowStock:products.filter(p=>p.stock<=CONFIG.LOW_STOCK)};
}
