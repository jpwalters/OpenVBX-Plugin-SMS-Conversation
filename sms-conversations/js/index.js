function formatePhoneNumber(phone) {
	
	return phone.substr(0,2) + ' ' + '(' + phone.substr(2,3) + ') ' + phone.substr(5,3) + '-' + phone.substring(8); 
}

function getSmsHistory(smsId) {
	
	$('.chat-history-messages').empty();
	
	$.post( "sms-conversation",{id:smsId,action:'sms-messages'}, function( data ) {
	
		var firstTo = '';
		var secondTo = '';
		
		$.each(data, function(k, v) {
			
			var date = new Date(v.created + ' GMT');
			
			if(firstTo == '' || firstTo == v.to) {
				firstTo = v.to;
				message = '<li class="clearfix">';
				message += '<div class="message-data align-right">';
				
				if(v.call_sid.substr(0,2)==='MM') {
					message += '<a href="#" class="mms-image" id="' + v.call_sid + '"><i class="message-data-name fa fa-picture-o" style="padding-right:50%;"> View Image</i></a>';
				}
				
				message += '<span class="message-data-time" >' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '</span> &nbsp; &nbsp;';
				message += '<span class="message-data-name" >' + v.to + '</span></div>';				
				message += '<div class="message other-message float-right">';
				message += v.message;				
				message += '</div></li>';
			}
			else if(secondTo == '' || secondTo == v.to){
				secondTo = v.to;
				message = '<li>';
				message += '<div class="message-data">';
				message += '<span class="message-data-name">' + v.to + '</span>';
				message += '<span class="message-data-time">' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '</span>';
				
				if(v.call_sid.substr(0,2)==='MM') {
					message += '<a href="#" class="mms-image" id="' + v.call_sid + '"><i class="message-data-name fa fa-picture-o" style="padding-left:50%;"> View Image</i></a>';
				}
				
				message += '</div>';
				
				
				message += '<div class="message my-message">';
				message += v.message;			
				message += '</div></li>';
			}
			
			$('#sms-messageid').val(v.id);
			$('.chat-history-messages').append(message);
		});
		
		$('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
	});
}

$(document).ready(function(){

		$(function(){
					
			var
			select = $('#smss'),
			firstRun = true,
			updateSmsList = function() {
				$.post( "sms-conversation",{action:'sms-list'}, function( data ) {
					$.each(data, function(sms, details) {
						
						var date = new Date(details.created + ' GMT');
						
						if($('#' + details.from.substring(1)).length == 0) {
							
							row = '<tr class="message-row recording-type ' + (details.status=='new'?'unread':'') + '" id="' + details.from.substring(1) + '">';
							row += '<td class="recording-date">' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + '</td>';
							row += '<td class="from">' + formatePhoneNumber(details.from) + '</td>';
							row += '<td class="to">' + formatePhoneNumber(details.to) + '</td>';
							row += '<td>' + details.message_count + '</td></tr>';
								
							if(firstRun)								
								select.append(row);
							else {
								$("#smss tr:first").before(row);
								$('#notify')[0].play();
							}
						}
						else {
							
							if(details.status=='new' && !$('#' + details.from.substring(1)).hasClass("unread")) {
								
								var row = '#' + details.from.substring(1);
								$(row).addClass("unread");
								$(row + " td.recording-date").html(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
															
								$("#smss tr:first").before($(row));

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
		
		$('.mms-image').click(function(e) {
			e.preventDefault();
		});
});