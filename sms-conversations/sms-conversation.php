<?php 

	if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'sms-list') {
		$query = $this->db->query("select (select created from messages where caller = data.from order by created desc limit 1) as created, data.*, (select status from messages where caller = data.from order by created desc limit 1) as 'status' from (select caller as 'from',called as 'to', count(id) as 'message_count' from messages where created > DATE_SUB(NOW(), INTERVAL 2.5 DAY) group by caller order by created desc) as data order by created desc ");
		echo json_encode($query->result());
		exit;
	}
	else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'sms-messages') {
		
		//first mark all messages are read
		$this->db->query("update `messages` set `read`=current_timestamp, `status`='read' where status='new' and caller='".$_POST['id']."'");
		
		$sql = "select (select id from `messages` where caller = '". $_POST['id'] ."' order by created desc limit 1) as 'id',data.* from (select created, call_sid, caller as 'to',called as 'from',content_text as 'message' from messages where caller = '". $_POST['id'] ."' union select created, '' as 'call_sid', concat('+1',Replace(Replace(Replace(Replace(SUBSTRING(description,1,14),'(',''),')',''),' ',''),'-','')) as 'to', concat('+1',Replace(Replace(Replace(Replace(SUBSTRING(description,19,14),'(',''),')',''),' ',''),'-','')) as 'from', SUBSTRING(description,35) as 'message'  from annotations where annotation_type = 6 and message_id in (select id from messages where caller = '". $_POST['id'] ."')) as data order by created";
		
		$query = $this->db->query($sql);
		echo json_encode($query->result());
		exit;
	}
	else if($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'mms-media') {
		//$account = OpenVBX::getAccount();
		//$media_url = "Accounts/{$this->twilio_sid}/Messages/{$_POST['id']}/Media.json";
		//$mediaObj = $account->request($media_url, "GET");
		//echo $mediaObj;
		//echo json_encode($account->messages->get($_POST['id'])->media);
		$ci = & get_instance();
				
		require_once(APPPATH . 'libraries/twilio.php');
				
		$ci->twilio = new TwilioRestClient($ci->twilio_sid,$ci->twilio_token,$ci->twilio_endpoint);
		$media_url = "Accounts/{$this->twilio_sid}/Messages/{$_POST['id']}/Media.json";
		$mediaObj = $ci->twilio->request($media_url, "GET");
		echo $mediaObj->ResponseText;
		
		exit;		
	}
?>

<link rel='stylesheet prefetch' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css'>

<?php 

// Chat UI Design by Julia Smith
// http://www.bypeople.com/web-chat-widget/
// http://codepen.io/drehimself/pen/KdXwxR?utm_source=bypeople


OpenVBX::addCSS('css/style.css');
OpenVBX::addCSS('css/jquery.light.css'); 

?>


<div class="vbx-content-main">
	<div class="vbx-content-menu vbx-content-menu-top">
		<h2 class="vbx-content-heading">SMS Conersation List</h2>
	</div><!-- .vbx-content-menu -->
	<div class="vbx-content-container">
		<div class="vbx-content-section">
			<div class="smsList" style="float:left; width:45%;">
				<table class="vbx-items-grid" border="0" id="smsList">
					<thead>
						<tr class="items-head recording-head"><th>Date</th><th>From</th><th>To</th><th>Messages</th></tr>
					</thead>
					<tbody id="smss">

					</tbody>
				</table>
			</div>
			<div style="float:left; width:55%;">
				<div class="chat">
					<div class="chat-header clearfix">       
						<div class="chat-about">
							<div class="chat-with" style="float:left; width:95%;"><-- Click to View Conersation</div>
							<div style="float:left;"><a href="#" class="quick-call-button"></a></div>
						</div>
					</div> <!-- end chat-header -->
				  
				  <div class="chat-history">
					<ul class="chat-history-messages">
					  			  
					</ul>
					
				  </div> <!-- end chat-history -->
				  
				  <div class="chat-message clearfix">
					<textarea name="message-to-send" id="message-to-send" placeholder ="Type your message" rows="3"></textarea>        
					<button id="sendSMS">Send</button>
					<input type="hidden" id="sms-messageid" value="">
					<input type="hidden" id="sms-to-phone" value="">
					<input type="hidden" id="sms-from-phone" value="">
				  </div> <!-- end chat-message -->
      
				</div> <!-- end chat -->
			</div>
		</div><!-- .vbx-content-section -->
	</div><!-- .vbx-content-container -->	
</div><!-- .vbx-content-main -->

<audio id="notify">
<source src="/plugins/sms-conversation/assets/notify.mp3"></source>
</audio>

<?php 

OpenVBX::addJS('js/index.js'); 
OpenVBX::addJS('js/jquery.light.js');
?>
