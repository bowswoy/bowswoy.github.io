$(function(){

  var bg_opacity_scale = 30;
  var img_opacity_scale = 30;
  var bg_img;
  var quote_text;
  var font_text = 'cs_chatthaiuiregular';
  var count_quote_text = 1;
  var default_color_text = $('#cp8').colorpicker().data('colorpicker').color;
  var count_image = 1;

  fabric.Object.prototype.transparentCorners = false;
	var canvas = new fabric.Canvas('c');
	canvas.backgroundColor = "#e8e2d3";

  $('#cp7').colorpicker({color: "#e8e2d3"}).on('changeColor', function(e) {
			canvas.backgroundColor = e.color.toString('rgba');
			canvas.renderAll();
      $('#cp7').css({'background-color':e.color.toString('rgba')});
	});

  $('#cp8').colorpicker().on('changeColor', function(e) {
      var active_obj = canvas.getActiveObject();
      default_color_text = e.color.toString('rgba');
      draw_text($('#quote_text').val(), active_obj.id);
      canvas.renderAll();
	});

  $('.choose-image > img').click(function(){
    clear_bg();
    fabric.Image.fromURL($(this).attr('src'), function(oImg) {
      oImg.scale(1).setOpacity($('#bg_opacity').val() / bg_opacity_scale);
      render_bg(oImg);
    });
  });

  $('#bg_upload').change(function(e){
    var reader = new FileReader();
    reader.onload = function (event) {
      clear_bg();
      var imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = function () {
          var image = new fabric.Image(imgObj, {
            opacity : $('#bg_opacity').val() / bg_opacity_scale,
            scaleY : canvas.height / imgObj.height,
            scaleX : canvas.width / imgObj.width,
          });
          render_bg(image);
      }
    }
    reader.readAsDataURL(e.target.files[0]);
    $(this).val('');
  });

  $(document).on('input', '#bg_opacity', function() {
			if (bg_img) {
				bg_img.opacity = $(this).val() / bg_opacity_scale;
				canvas.renderAll();
			}
	});

  $('#addtext').click(function(){
    $('#text_detail').show();
    $('#image_detail').hide();
		quote_text_val('ใส่ข้อความได้เลยจ้า');
    draw_text("ใส่ข้อความได้เลยจ้า", count_quote_text);
  });

  $('#addsticker').click(function(){
      $('#text_detail').hide();
      $('#image_detail').show();
  });

  $('#quote_text').on('keyup', function(e){
		var active_obj = canvas.getActiveObject();
		val = $(this).val();
		if(active_obj.id != null) {
			text_id = active_obj.id;
		} else {
			text_id = count_quote_text;
		}
		draw_text(val, text_id);
	});

  canvas.on('object:selected',function(e){
		if(e.target) {
			var eTarget = e.target;
			width = eTarget.width * eTarget.scaleX;
			add_delete_btn(eTarget.oCoords.mt.x, eTarget.oCoords.mt.y, width);
      if(eTarget.id != null && eTarget.type == 'text') {
        canvas.bringToFront(canvas.getActiveObject());
        var hex =  eTarget.fill;
        quote_text_val(eTarget.text);
				quote_text = canvas.getActiveObject();
        canvas.renderAll();
        $('#text_detail').show();
        $('#image_detail').hide();
        $('#img_tools').hide();
      } else if(eTarget.id != null && eTarget.type == 'image') {
        var active_obj = canvas.getActiveObject();
        $('#image_detail').show();
        $('#text_detail').hide();
        $('#img_tools').show();

        $(document).on('input', '#img_opacity', function() {
          active_obj.opacity = $(this).val() / img_opacity_scale;
					canvas.renderAll();
        });

      }
    }

    $(document).keydown(function (e) {
			var key = e.keyCode || e.charCode;
		    if( key == 46 ) {
		    	$('.delete_btn').trigger('click');
		    }
		});
	});

  canvas.on('object:modified',function(e){
		width = e.target.width * e.target.scaleX;
		add_delete_btn(e.target.oCoords.mt.x, e.target.oCoords.mt.y, width);
	});

  canvas.on('object:moving',function(e){
		$(".delete_btn").remove();
	});

  canvas.on('selection:cleared',function(e){
		$(".delete_btn").remove();
		$('#text_detail').hide();
		$('#image_detail').hide();
    $('#img_tools').hide();
	});

  $(document).on('click',".delete_btn",function(){
		var active_obj = canvas.getActiveObject();
		if (active_obj) {
			canvas.remove(active_obj);
			canvas.deactivateAll();
		} else {
			canvas.remove(bg_img);
		}
		$(".delete_btn").remove();
	});

  $('.custom-font').click(function(){
    var customfont = $(this).attr('id');
    var active_obj = canvas.getActiveObject();
		if(active_obj != null) {
			active_obj.set("fontFamily", customfont);
			font_text = customfont;
			canvas.renderAll();
      $('#dropdownMenu1').css('font-family', customfont);
		}
  });

	$(".choose-image-pic > img").click(function(){
		$('#image_detail').show();
    $('#img_tools').show();
    $('#text_detail').hide();
		add_image_to_canvas($(this).attr('src'));
	});

  // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  // $('.save').attr({
  //     'download': 'YourProduct.png',  /// set filename
  //     'href'    : image              /// set data-uri
  // });

  $('.save').click(function(){
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    $(this).attr({
        'download': new Date(Date.now()).toLocaleString() + '.png',  /// set filename
        'href'    : image              /// set data-uri
    });
  });

  function add_image_to_canvas(img_url) {
		fabric.Image.fromURL(img_url , function(url_img) {
			url_img.id = 'image-' + count_image;
			canvas.add(url_img.set({left: 200, top: 300, angle: 00}));
			canvas.setActiveObject(url_img);
			count_image++;
		},{crossOrigin: ''});
	}

  function draw_text(val, text_id){
 		var active_obj = canvas.getActiveObject();
    if(active_obj != null && active_obj.id == text_id) {
      	active_obj.setText(val);
        active_obj.setColor(default_color_text);
      	quote_text_val(val);
    } else {
      quote_text = new fabric.Text(val, {
        id : 'text-' + text_id,
        fill : default_color_text,
		fontSize: 60,
        left: 80,
        top: 100 ,
        fontFamily : font_text,
        textAlign: 'center'
      });
      canvas.add(quote_text);
      canvas.setActiveObject(quote_text);
      count_quote_text++;
    }
		canvas.renderAll();
	}

  function quote_text_val(val) {
		$('#quote_text').val(val);
	}

  function add_delete_btn(x, y, w){
		$(".delete_btn").remove();
		var left = x - 34;
		var btnTop = y + 46;
		var widthadjust=w/2;
		left = widthadjust+left;
		var delete_btn = '<span class="delete_btn" style="top:'+btnTop+'px;left:'+left+'px;">[<a href="javascript:;" style="color:red;">ลบ</a>]</span>';
		$(".canvas-container").append(delete_btn);
	}

  function clear_bg() {
  	canvas.remove(bg_img);
  	$(".delete_btn").remove();
  }
  function render_bg(bg_obj) {
		canvas.add(bg_obj);
		bg_obj.evented = true;
		bg_obj.hasControls  = false;
		bg_obj.hasRotatingPoint  = false;
		bg_obj.selectable = false;
		bg_obj.sendToBack();
		bg_img = bg_obj;
	}

});
