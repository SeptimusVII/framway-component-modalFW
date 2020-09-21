module.exports = function(app){
    var ModalFW = Object.getPrototypeOf(app).ModalFW = new app.Component("modalFW");
    //ModalFW.debug = true;
    ModalFW.createdAt      = "2.0.0";
    ModalFW.lastUpdate     = "2.0.0";
    ModalFW.version        = "1";
    // ModalFW.factoryExclude = true;
    // ModalFW.loadingMsg     = "This message will display in the console when component will be loaded.";
    // ModalFW.requires       = [];

    // ModalFW.prototype.onCreate = function(){
    // do thing after element's creation
    // }
    return ModalFW;
}