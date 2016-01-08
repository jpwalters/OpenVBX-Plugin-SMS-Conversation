function formatePhoneNumber(phone) {
	
	return phone.substr(0,2) + ' ' + '(' + phone.substr(2,3) + ') ' + phone.substr(5,3) + '-' + phone.substring(8); 
}

function getSmsHistory(smsId) {
	
	$('.chat-history-messages').empty();
	
	$.post( "sms-conversation",{id:smsId,action:'sms-messages'}, function( data ) {
	
		var firstTo = '';
		var secondTo = '';
		
		$.each(data, function(k, v) {
			
			var smsTimeStamp = v.created;
			var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

			if(is_chrome)
			{
				var date = new Date(v.created + ' GMT');
				smsTimeStamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
			}
			
			
			
			if(firstTo == '' || firstTo == v.to) {
				firstTo = v.to;
				message = '<li class="clearfix">';
				message += '<div class="message-data align-right">';
						
				if(v.call_sid.substr(0,2)==='MM') {
					message += '<i class="message-data-name fa fa-picture-o" style="padding-right:50%;"> MMS</i>';
				}
				
				message += '<span class="message-data-time" >' + smsTimeStamp + '</span> &nbsp; &nbsp;';
				message += '<span class="message-data-name" >' + v.to + '</span></div>';				
				message += '<div class="message other-message float-right">';
				
				if(v.call_sid.substr(0,2)==='MM') {
					var media = getMmsMedia(v.call_sid);
					
					$.each(media, function(k2, v2) {
						var url = '"https://api.twilio.com/2010-04-01/Accounts/' + v2.account_sid + '/Messages/' + v2.parent_sid + '/Media/' + v2.sid + '"';
						
						message += '<img data-gallery="' + v2.parent_sid + '" rel="' + v2.parent_sid + '" class="mms-media ' + v2.parent_sid + '" width="100px" height="100px" src=' + url + ' type="' + v2.content_type + '">&nbsp;';
					});
					
					message += '<br>';
				}
				
				message += v.message;				
				message += '</div></li>';
			}
			else if(secondTo == '' || secondTo == v.to){
				secondTo = v.to;
				message = '<li>';
				message += '<div class="message-data">';
				message += '<span class="message-data-name">' + v.to + '</span>';
				message += '<span class="message-data-time">' + smsTimeStamp + '</span>';
				
				if(v.call_sid.substr(0,2)==='MM') {
					message += '<i class="message-data-name fa fa-picture-o" style="padding-right:50%;"> MMS</i>';
				}
				
				message += '</div>';
				
				
				message += '<div class="message my-message">';
				
				if(v.call_sid.substr(0,2)==='MM') {
					var media = getMmsMedia(v.call_sid);
					
					$.each(media, function(k2, v2) {
						var url = '"https://api.twilio.com/2010-04-01/Accounts/' + v2.account_sid + '/Messages/' + v2.parent_sid + '/Media/' + v2.sid + '"';
						
						message += '<img data-gallery="' + v2.parent_sid + '" rel="' + v2.parent_sid + '" class="mms-media ' + v2.parent_sid + '" width="100px" height="100px" src=' + url + ' type="' + v2.content_type + '">&nbsp;';
					});
					
					message += '<br>';
				}
				
				message += v.message;			
				message += '</div></li>';
			}
			
			$('#sms-messageid').val(v.id);
			$('.chat-history-messages').append(message);
		});
		
		$('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
	});
}

function getMmsMedia(mmsId) {
	
	var media;
	
	$.ajax({
        url: 'sms-conversation',
        type: 'POST',
        async: false,
		data: {id:mmsId,action:'mms-media'},
		error: function(){
            media = null;
        },
        success: function(data){ 
			media = data.media_list;
        }
    });
	
	return media;
}

$(document).ready(function(){

		$(function(){
					
			var
			select = $('#smss'),
			firstRun = true,
			updateSmsList = function() {
				$.post( "sms-conversation",{action:'sms-list'}, function( data ) {
					$.each(data, function(sms, details) {
						
						var smsTimeStamp = details.created;
						
						var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

						if(is_chrome)
						{
							var date = new Date(details.created + ' GMT');
							smsTimeStamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
						}
						
						
						if($('#' + details.from.substring(1)).length == 0) {
							
							row = '<tr class="message-row recording-type ' + (details.status=='new'?'unread':'') + '" id="' + details.from.substring(1) + '">';
							row += '<td class="recording-date">' + smsTimeStamp + '</td>';
							row += '<td class="from">' + formatePhoneNumber(details.from) + '</td>';
							row += '<td class="to">' + formatePhoneNumber(details.to) + '</td>';
							row += '<td class="message-count">' + details.message_count + '</td></tr>';
								
							if(firstRun)								
								select.append(row);
							else {
								
								if($('#smss tr').length == 0) {
									$('#smss').append(row);
								}
								else {
									$("#smss tr:first").before(row);
								}								
								
								$('#notify')[0].play();
							}
						}
						else {
							
							if(details.status=='new' && !$('#' + details.from.substring(1)).hasClass("unread")) {
								
								var row = '#' + details.from.substring(1);
								$(row).addClass("unread");
								$(row + " td.recording-date").html(smsTimeStamp);
								$(row + " td.message-count").html(details.message_count);						
								
								if($('#smss tr').length > 1) {
									$("#smss tr:first").before($(row));
								}
								
								$('#notify')[0].play();
							}
							else if(details.status=='read') {
								$('#' + details.from.substring(1)).removeClass("unread");
							}							
						}
					});
					
					firstRun = false;
				});
			};

			updateSmsList();
			setInterval(updateSmsList, 5000);
		});
  
		$('#smss').delegate('tr', 'click', function(e) {
			e.preventDefault();

			var smsId = $(this).closest('tr').attr('id');
			
			$('.chat-with').empty();
			$(this).closest('tr').removeClass("unread");
			
			var txt = $(this).closest('tr').children('td.from').text()
			$('.chat-with').text('Chat with ' + txt);
			$('#sms-to-phone').val('+' + smsId);
			$('#sms-from-phone').val($(this).closest('tr').children('td.to').text().substr(3));
			
			getSmsHistory('+' + smsId);
		});

		$('#sendSMS').click(function(e) {
			e.preventDefault();
			
			$.post( "/messages/sms/" + $('#sms-messageid').val(),{to:$('#sms-to-phone').val(),from:$('#sms-from-phone').val(),content:$('#message-to-send').val()}, function( data ) {
				
				if(!data.error) {
					$('#message-to-send').val('');
				}
				else {
					alert("SMS failed to send!");
				}
			});
			
			setTimeout(function() { getSmsHistory($('#sms-to-phone').val()); }, 1500);			
		});
		
		$('.quick-call-button').click(function(e) {
			e.preventDefault();		
			
			window.parent.Client.call({'Digits': 1,'record':'true','to': $('#sms-to-phone').val(),'from': $('#sms-from-phone').val(),'callerid':$('#sms-from-phone').val()});
		});
				
		//mms image popup
		$(".mms-media").live('click',function(e){

			$('img[rel=' + $(this).attr('rel') + ']').light({
				unbind:true, //whether to unbind other click events from elements
				prevText:'Previous', //the text on the "Previous" button
				nextText:'Next', //the text on the "Next" button
				loadText:'Loading...', //the text to display when loading
				keyboard:true //whether to use the keyboard inputs for next, previous and close
			});
			
		});
});