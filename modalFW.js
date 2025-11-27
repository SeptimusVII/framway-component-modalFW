module.exports = function(app){
    var ModalFW = Object.getPrototypeOf(app).ModalFW = new app.Component("modalFW");
    // ModalFW.debug = true;
    ModalFW.createdAt      = "2.0.0";
    ModalFW.lastUpdate     = "2.7.0";
    ModalFW.version        = "1.4.2";
    // ModalFW.factoryExclude = true;
    // ModalFW.loadingMsg     = "This message will display in the console when component will be loaded.";
    // ModalFW.requires       = [];

    
    ModalFW.prototype.onResize = function(){};
    ModalFW.prototype.onDestroy = function(){
        var modal = this;
        if(ModalFW.debug) console.log('Modal '+this.name+' has been destroyed \n ');
    };
    ModalFW.prototype.onCreate = function(){
        var modal = this;
        // attributes
        modal.name            = (modal.name !== undefined)              ? modal.name            : modal.getData('name', 'modalFW-'+utils.uniqid());
        modal.title           = (modal.title !== undefined)             ? modal.title           : modal.getData('title',false);
        modal.width           = (modal.width !== undefined)             ? modal.width           : modal.getData('width',false);
        modal.url             = (modal.url !== undefined)               ? modal.url             : modal.getData('url',false);
        modal.selector        = (modal.selector !== undefined)          ? modal.selector        : modal.getData('selector',false);
        modal.removeEl        = (modal.removeEl !== undefined)          ? modal.removeEl        : modal.getData('removeel','').split(',');
        modal.container       = (modal.container !== undefined)         ? modal.container       : modal.getData('container','body');
        modal.blnAutoload     = (modal.blnAutoload !== undefined)       ? modal.blnAutoload     : modal.getData('autoload',true);
        modal.blnOpen         = (modal.blnOpen !== undefined)           ? modal.blnOpen         : modal.getData('open',false);
        modal.blnRefresh      = (modal.blnRefresh !== undefined)        ? modal.blnRefresh      : modal.getData('refresh',false);
        modal.blnDismiss      = (modal.blnDismiss !== undefined)        ? modal.blnDismiss      : modal.getData('dismiss',true);
        modal.blnAutodestroy  = (modal.blnAutodestroy !== undefined)    ? modal.blnAutodestroy  : modal.getData('autodestroy',false);
        if (app.components.includes('select2FW') && $(modal.$el).find('.select2FW-wrapper')) {
            $(modal.$el).find('.select2FW-wrapper').each(function(){
                $(this).find('select:not(.custom)').select2FW('get').reset();
            })
        }
        modal.content         = (modal.content !== undefined)           ? modal.content         : modal.$el.html();
        modal.buttons         = (modal.buttons !== undefined)           ? modal.buttons         : {};
        modal.onOpen          = (modal.onOpen !== undefined)            ? modal.onOpen          : function(){ modal.log('onOpen'); };
        modal.onClose         = (modal.onClose !== undefined)           ? modal.onClose         : function(){ modal.log('onClose'); };
        modal.onRefresh       = (modal.onRefresh !== undefined)         ? modal.onRefresh       : function(){ modal.log('onRefresh'); };
        modal.gallery         = (modal.gallery !== undefined)           ? modal.gallery         : modal.getData('gallery',false);
        modal.headerSticky    = (modal.headerSticky !== undefined)      ? modal.headerSticky    : modal.getData('headersticky',false);
        modal.isOpen          = false;


        if(ModalFW.debug) console.log("Creating "+modal.name+" ... ");
        // abort if the modal already exist
        if(utils.getObjBy(app.components_active.modalFW,'name',modal.name).length){
            if(ModalFW.debug) console.log("Modal "+modal.name+" has been detected a duplicate. Aborting modal creation. \n ");
            modal.destroy();
            return false;
        }

        // trigger's settings
        modal.$trigger = modal.$trigger || modal.name;
        if(modal.$trigger instanceof jQuery === false){
            modal.$trigger = $('*[data-modal="'+modal.name+'"]').addClass('modalFW__trigger');
        }

        // html construct
        modal.$el.attr('data-name',modal.name);
        if (modal.gallery)
            modal.$el.attr('data-gallery',modal.gallery);
        if (modal.headerSticky)
            modal.$el.addClass('modalFW--headerSticky');
        modal.$wrapper = $('<div class="modalFW__wrapper"></div>');
        modal.$header  = $('<div class="modalFW__header"></div>');
        modal.$content = $('<div class="modalFW__content"></div>');
        modal.$loader  = $('<div class="modalFW__loader"><i class="fas fa-circle-notch fa-spin"></i></div>');
        modal.$refresh = $('<div class="modalFW__refresh"><i class="fas fa-sync-alt"></i></div>');
        modal.$close   = $('<div class="modalFW__close"><i class="fas fa-times"></i></div>');
        if(modal.blnRefresh)
            modal.$header.append(modal.$refresh);
        modal.$header.append(modal.$close);
        modal.$wrapper
            .append(modal.$header)
            .append(modal.$loader)
            .append(modal.$content)
        ;
        if(modal.width)
            modal.$wrapper.css({
                'width' : modal.width,
                'max-width' : '100%'
            });

        modal.$el.get(0).innerHTML = '';
        modal.$el.append(modal.$wrapper);
        if (modal.container == "body") 
            modal.$el.appendTo($('body'));
        
        if (modal.gallery){
            var i = (utils.getObjBy(app.components_active.modalFW,'gallery',modal.gallery).length - 1) | 0;
            modal.galleryIndex = i;
            modal.$el.attr('data-index',i)
            modal.$el
                .append('<div class="modalFW__arrow prev"></div>')
                .append('<div class="modalFW__arrow next"></div>')
            ;
        }

        // actions according to parameters
        if(modal.blnAutoload)
            modal.setContent();
        if(modal.$trigger)
            modal.$trigger.addClass('ready');
        if(modal.blnOpen)
            modal.open();
        if (modal.blnRefresh)
            modal.$refresh.on('click',function(){
              modal.setContent();
            });

        if(ModalFW.debug) console.log("Modal "+modal.name+" has been created \n ");
        return modal;
    }

    /**
     * Set the modal's content & title according to its attributes
     */
    ModalFW.prototype.setContent = function(){
        var modal = this;
        return new Promise(function(resolve,reject){
            modal.$el.removeClass('ready').find('.modalFW__title,.modalFW__footer').remove();
            if(modal.title)
                modal.$header.prepend('<div class="modalFW__title">'+modal.title+'</div>');
            if(utils.getObjSize(modal.buttons) > 0){
                modal.$footer = $('<div class="modalFW__footer"></div>');
                $.each(modal.buttons,function(index,button){
                    var $button = $('<button></button>');
                    if(button.url && button.url != '')
                        $button = $('<a class="btn" href="'+button.url+'"></a>')
                    if(button.label)
                        $button.html(button.label);
                    else
                        $button.html(index);
                    if(button.classes)
                        $button.addClass(button.classes);
                    if(button.action && typeof button.action == 'function' && !button.url)
                        $button.on('click',button.action);
                    modal.$footer.append($button);
                });
                modal.$wrapper.append(modal.$footer);
            }
            if(modal.url){
                if(utils.isImageUrl(modal.url)){
                    var img = new Image();
                    img.src = modal.url;
                    img.onload = function(){
                        modal.$content.html(img);
                        modal.$el.addClass('modalFW--img ready');
                    };
                    img.onerror = function(){
                        modal.$content.html('<p class="error">Error: unable to display this image <br>(url: '+modal.url+')</p>');
                        modal.$el.addClass('ready');
                    };
                } else {
                    new Promise(function(resolve,reject){
                        $.ajax({
                            url: modal.url
                        })
                        .done(function(result){resolve(result)})
                        .fail(function(error) {reject()});
                    }).then(function(result){
                        // result = new DOMParser().parseFromString(result, 'text/html');
                        if(modal.selector && $(result).find(modal.selector).length)
                            result = $(result).find(modal.selector);
                        if (modal.removeEl.length) 
                            for (var selector of modal.removeEl) 
                                $(result).find(selector).remove();
                        modal.$content.html(result);
                        modal.$el.addClass('ready');
                    }).catch(function(error){
                        modal.$content.html('<p class="error">An error occured while requesting '+modal.url+'</p>');
                        modal.$el.addClass('ready');
                    });
                }
            } else if(modal.content != ''){
                modal.$content.html(modal.content);
                modal.$el.addClass('ready');
            }
            resolve();
        });
    };
    ModalFW.prototype.open = function(){
        var modal = this;
        $.each(app.components_active.modalFW.filter(function(item){return !Object.is(item,modal);}),function(){ if (this.isOpen) this.close(); });
        $('html').addClass('overflow-hidden');
        modal.$el.scrollTop(0);
        modal.$el.addClass('active');
        modal.isOpen = true;
        if (modal.gallery) 
            document.addEventListener('keyup', ModalFW.galleryNav);
        if(!modal.autoload && !this.$el.hasClass('ready'))
            modal.setContent();
        if(modal.onOpen)
            modal.onOpen();
        return modal;
    };
    ModalFW.prototype.close = function(){
        var modal = this;
        $('html').removeClass('overflow-hidden');
        modal.$el.removeClass('active');
        modal.isOpen = false;
        if (modal.gallery) 
            document.removeEventListener('keyup', ModalFW.galleryNav);
        if(modal.onClose){
            if (modal.blnAutodestroy) {
                Promise.resolve(modal.onClose()).then(function(){
                    setTimeout(function(){
                        modal.destroy();
                    },parseFloat(getComputedStyle(modal.$el.get(0))['transitionDuration'])*1000)
                });
            } else{
                modal.onClose();
            }
        }
        return modal;
    };
    ModalFW.prototype.refresh = function(){
        var modal = this;
        modal.setContent().then(function(){
            if(modal.onRefresh)
                modal.onRefresh();
        });
        return modal;
    };

    ModalFW.galleryNav = function(event){
        // console.log(event);
        switch(event.which){
            case 27: // escape
                $('.modalFW.active .modalFW__close').trigger('click');
                break;
            case 37: // left
                // console.log('go prev');
                $('.modalFW.active .modalFW__arrow.prev').trigger('click');
                break;
            case 39: // right
                // console.log('go next');
                $('.modalFW.active .modalFW__arrow.next').trigger('click');
                break;
            case 38: // up
            case 40: // down
            default: return; // exit this handler for other keys
        }
        event.preventDefault();
    };

    ModalFW.createModalFromTrigger = function($trigger){
        $trigger = $($trigger).addClass('modalFW__trigger');
        if(ModalFW.debug) console.log("Trying to create modal "+$trigger.data('modal')+" ...");
        if(!$('.modalFW[data-name="'+$trigger.data('modal')+'"]').length){
            if(!$trigger.data('modal')){
                if(ModalFW.debug) console.log('Failed to create modal : please define data-modal\n ');
                return false;
            }
            if(!$trigger.data('content') && !$trigger.attr('href') && !$trigger.data('url')){
                if(ModalFW.debug) console.log('Failed to create modal "'+$trigger.data('modal')+'" : please define data-content, data-url or href attributes \n ');
                return false;
            }
            var objConfig = {
                name : $trigger.data('modal'),
                title: $trigger.data('title'),
                selector: $trigger.data('selector'),
                removeEl: $trigger.data('removeel')?$trigger.data('removeel').split(','):false,
                blnOpen : $trigger.data('open'),
                blnAutoload : $trigger.data('autoload'),
                blnAutodestroy : $trigger.data('autodestroy'),
                blnDismiss : $trigger.data('dismiss'),
                blnRefresh : $trigger.data('refresh'),
                gallery : $trigger.data('gallery'),
                $trigger : $trigger
            };
            if($trigger.data('content'))
                objConfig.content = $trigger.data('content');
            else if($trigger.data('url'))
                objConfig.url = $trigger.data('url');
            else if($trigger.attr('href'))
                objConfig.url = $trigger.attr('href');
            var modal = new ModalFW(objConfig);
        } else {
            if(ModalFW.debug) console.log("Modal "+$trigger.data('modal')+" already exist. Aborting creation \n ");
            $trigger.addClass('ready')
        }
    }

    $(function () {
        $('body').on('click','.modalFW__arrow',function(e){
            var gallery = $(this).closest('.modalFW').attr('data-gallery');
            var current, next;
            if ($('.modalFW[data-gallery='+gallery+']').length>1) {
                // console.log('navigating through existing modals');
                current = parseInt($(this).closest('.modalFW').attr('data-index').replace(gallery+'__',''));
                if ($(this).hasClass('prev'))
                    next = (current - 1 >= 0) ? current - 1 : $('.modalFW[data-gallery='+gallery+']').length - 1;
                else if ($(this).hasClass('next')){
                    next = (current + 1 <= ($('.modalFW[data-gallery='+gallery+']').length - 1)) ? current + 1 : 0; 
                }
                if ($('.modalFW[data-gallery='+gallery+'][data-index='+next+']').length) 
                    $('.modalFW[data-gallery='+gallery+'][data-index='+next+']').modalFW('get').open();
            } else if($('.modalFW__trigger[data-gallery='+gallery+']').length>1){
                // console.log('navigating through modals triggers');
                current = $('.modalFW__trigger[data-gallery='+gallery+']').index($(this).closest('.modalFW').modalFW('get').$trigger);
                if ($(this).hasClass('prev'))
                    next = (current - 1 >= 0) ? current - 1 : $('.modalFW__trigger[data-gallery='+gallery+']').length - 1;
                else if ($(this).hasClass('next')){
                    next = (current + 1 <= ($('.modalFW__trigger[data-gallery='+gallery+']').length - 1)) ? current + 1 : 0; 
                }
                if($('.modalFW__trigger[data-gallery='+gallery+']').eq(next).length)
                    $('.modalFW__trigger[data-gallery='+gallery+']').eq(next).get(0).dispatchEvent(new Event('click'))
            }
            // console.log(current,next)
            // console.log($('.modalFW[data-gallery='+gallery+'][data-index='+next+']').modalFW('get'));
        });
        $('body').on('click','.modalFW__refresh',function(e){
            $(this).closest('.modalFW').modalFW('get').refresh();
        });
        $('body').on('click','.modalFW__trigger',function(e){
            e.preventDefault();
            if($('.modalFW[data-name="'+$(this).data('modal')+'"]').length)
                $('.modalFW[data-name="'+$(this).data('modal')+'"]').modalFW('get').open();
        });
        var modalMouseDown;
        var modalMouseUp;
        $('body').on('mousedown','.modalFW',function(e){modalMouseDown = e.target;});
        $('body').on('mouseup','.modalFW',function(e){modalMouseUp = e.target;});
        $('body').on('click','.modalFW',function(e){
            if ($(e.target).hasClass('modalFW') && modalMouseDown == modalMouseUp) {
                if ($(this).modalFW('get').blnDismiss)
                    $(this).modalFW('get').close();
            } else if($(e.target).hasClass('modalFW__close')){
                $(this).closest('.modalFW').modalFW('get').close();
            }
        });

        $('*[data-modal]').not('.modalFW__trigger').each(function(){
            ModalFW.createModalFromTrigger(this);
        });
        utils.addHtmlHook('*[data-modal]:not(.modalFW__trigger)', function(item){
            $(item).each(function(){
                if(ModalFW.debug) app.log("Trigger added to dom for modal "+$(this).data('modal'));
                ModalFW.createModalFromTrigger(this);
            })
        });

    });


    return ModalFW;
}