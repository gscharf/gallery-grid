(function ($) {
    
    $.fn.createPortfolio = function(options){
        var defaults = {
          captionType               : 'popup',
          imagesPerPage             : options.portfolioItems.length,
          imagesPerRow              : 4,
          imageHeight               : 1000,
          imageWidth                : 1000,
          paginationPosition        : 'scroll',
          fitImagestoContainers     : false,
          enablePopupInfo           : true
        };

        var containerClass;
        var imageContainerWidth;
        var imageContainerHeight;
        var settings = $.extend({}, defaults, options);
        var totalNumImages = settings.portfolioItems.length;
        var numPages = Math.floor(totalNumImages / settings.imagesPerPage);
        if((totalNumImages % settings.imagesPerPage) !== 0)
            numPages++;
        var currentPage = 0;
                
        if(settings.imagesPerRow === 3) {
            containerClass = "<div class='content_container col-xs-6 col-sm-4 col-md-4 col-lg-4'>";
        } else {
            containerClass = "<div class='content_container col-xs-6 col-sm-3 col-md-3 col-lg-3'>"; 
        }       
        
        containerClass += "<a class='fancybox' rel='' href=''><div class='image_container_large loading'>";

        if(settings.captionType === 'popup') {   
              containerClass += "<div class='popup_info'><div class='popup_text'><p class='popup_caption'>  </p></div></div>";
        }

        containerClass += "<img class='main_img' src='' alt=''></div>"; 
                
        if (settings.captionType === 'static'){
              containerClass += "<div class='image_info row'><p class='caption'></p></div>";
        }        
        
        containerClass += "</a></div>"; 

        var thumbnail = "<a class='fancybox' rel='group_box' href=''><img src='' style='display: none;'></a>";

        createSkeleton();
        if(settings.paginationPosition !== 'scroll')
            createPagination();           

        function createSkeleton(){
            if(settings.paginationPosition !== 'scroll')
                $('.portfolio_page').empty();
            
            var startingImage = currentPage * settings.imagesPerPage;
            var lastImage = (settings.imagesPerPage + startingImage) < totalNumImages ? startingImage + settings.imagesPerPage : totalNumImages;             
            for(var i = startingImage; i < lastImage; i++){
                var newItem = $(containerClass).clone();
                var fancyBoxEl = $(newItem).find('a.fancybox');
                $(fancyBoxEl).attr('title', settings.portfolioItems[i].itemText);            
                $(fancyBoxEl).attr('href', settings.portfolioItems[i].imageLink);
                $(newItem).find('.main_img').attr('id', settings.portfolioItems[i].imageLink);
                $(fancyBoxEl).attr('rel', "groupbox_" + i);

                if(settings.captionType === 'popup') {
                    $(newItem).find('.popup_caption').append(settings.portfolioItems[i].itemText);  
                }else if (settings.captionType === 'static'){     
                    $(newItem).find('.image_info p').append(settings.portfolioItems[i].itemText);  
                }

                var numThumbs = settings.portfolioItems[i].secondaryImages.length;
                for(var j = 0; j < numThumbs; j++){
                    var newThumb = $(thumbnail).clone();
                    $(newThumb).attr('title', settings.portfolioItems[i].itemText);                
                    $(newThumb).attr('href', settings.portfolioItems[i].secondaryImages[j]);                
                    $(newThumb).find('img').attr('src', settings.portfolioItems[i].secondaryImages[j]);
                    $(newThumb).attr('rel', "groupbox_" + i);
                    $(newItem).find('.image_container_large').append(newThumb);
                }            
                $('.portfolio_page').append(newItem);

            }
            adjustContainers();
            loadImages();
        }
        
        function createPagination () {
            if (totalNumImages > settings.imagesPerPage) {
                var pagination = "<div class='gallery_pagination'></div>";
                if(settings.paginationPosition === 'top')
                    $('.portfolio_page').prepend(pagination);
                else
                    $('.portfolio_page').append(pagination);

                for(k = 0; k < numPages; k++){
                    if(currentPage == k){
                        $('.gallery_pagination').append("<div class='page_button selected' id='" + k + "'>" + (k + 1) + "</div>");
                    }else{
                        $('.gallery_pagination').append("<div class='page_button' id='" + k + "'>" + (k + 1) + "</div>");
                    } 
                }
            }
            
            $('.page_button').click(function(){
                currentPage = $(this).attr('id');
                $('.page_button').removeClass('selected');
                createSkeleton();
                createPagination();
            });            
        }

       $(window).resize(function () {
         adjustContainers();
         if(settings.fitImagestoContainers){
              $('.image_container_large img').removeAttr('style');
              $('.image_container_large .main_img').css('visibility', 'visible');
              $('.image_container_large .main_img').each(function(){
                    adjustImageSize($(this), imageContainerHeight);
              });
         }
       });    
       
        if(settings.paginationPosition === 'scroll') {
            $(window).scroll(function(){
              if($(window).scrollTop() + $(window).height() > $(document).height() - 50) {
                    if(currentPage < numPages){
                        currentPage++;
                        createSkeleton();
                    }
               }
            });
        }

       function adjustContainers() {        
         imageContainerWidth = $('.image_container_large').width();
         imageContainerHeight = ( settings.imageHeight / settings.imageWidth) * imageContainerWidth;
         var productInfoContainerH = $('.image_info').height();
         $('.image_container_large').css('height', imageContainerHeight + 'px');
         $('.content_container').css('min-height', imageContainerHeight + productInfoContainerH + 'px');
       };
       
       function loadImages(){
            $('.image_container_large').each(function(){
                  var image_container = $(this);
                  if(image_container.hasClass('loading')) {                     
                        var main_image = image_container.children('.main_img');
                        main_image.attr('src', main_image.attr('id'));
                        main_image.load(function(){
                             if(settings.fitImagestoContainers)
                                adjustImageSize($(this), imageContainerHeight); 
                             if(settings.enablePopupInfo)
                                image_container.hover(showProductDetails, hideProductDetails);
                             image_container.removeClass('loading');
                             var duration = Math.floor(Math.random()*1000);
                             main_image.css('visibility','visible').hide().fadeIn(duration);
                             image_container.siblings('.image_info').css('visibility','visible').hide().fadeIn(duration);
                        });
                  }
            });           
       }
       function adjustImageSize(image, containerHeight) {
           var imageHeight = $(image).height();
           if(imageHeight > containerHeight) {
             var imageWidth = $(image).width();
             var newW = (imageWidth / imageHeight) * containerHeight;
             $(image).css('width', newW + 'px');
           }          
       }

        function showProductDetails(){
          $(this).children(".popup_info").stop().fadeIn(400);
          $(this).addClass('imageFade');
        }

        function hideProductDetails(){
          $(this).children(".popup_info").stop().fadeOut(300);
          $(this).removeClass('imageFade');
        }       
        
    };
    
})(jQuery);