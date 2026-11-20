const {app,BrowserWindow,shell}=require('electron');
const path=require('node:path');
let mainWindow=null;
function openExternal(url){if(/^https?:\/\//i.test(url))shell.openExternal(url);}
function createWindow(){
 const win=new BrowserWindow({width:1440,height:960,minWidth:820,minHeight:640,backgroundColor:'#f6f7fb',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 mainWindow=win;
 win.webContents.setWindowOpenHandler(({url})=>{openExternal(url);return {action:'deny'}});
 win.webContents.on('will-navigate',(event,url)=>{if(url!==win.webContents.getURL()){event.preventDefault();openExternal(url)}});
 win.webContents.on('page-title-updated',event=>{event.preventDefault();win.setTitle('JobPrep · '+app.getVersion());});
 win.on('closed',()=>{if(mainWindow===win)mainWindow=null;});
 win.loadFile(path.join(__dirname,'..','index.html'));
}
if(!app.requestSingleInstanceLock()){
 app.quit();
}else{
 app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus();}});
 app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
