# OpenVBX Plugin SMS Conversation

[![Join the chat at https://gitter.im/jpwalters/OpenVBX-Plugin-SMS-Conversation](https://badges.gitter.im/jpwalters/OpenVBX-Plugin-SMS-Conversation.svg)](https://gitter.im/jpwalters/OpenVBX-Plugin-SMS-Conversation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Download][1] the latest release today!

This plugin will group sms conversations into a single list and when selected it will show the sms conversation thread in an instant messenger like view.

![screenshot](https://cloud.githubusercontent.com/assets/4819310/14590885/f0b0f738-04d3-11e6-8eab-478731f8a16a.png)

## Installation

To install this OpenVBX SMS plugin. Locate the `plugins` directory located in the main `OpenVBX` folder. Clone the repo and you are ready to start using it.

```
git clone git@github.com:gegere/OpenVBX-Plugin-SMS-Conversation.git sms-convseration
```


[1]: https://github.com/gegere/OpenVBX-Plugin-SMS-Conversation/releases/latest

## Usage

Once installed, SMS Conversations will appear in the OpenVBX sidebar under a new heading entilted SMS.  Be sure to configure a flow that allows SMS messages to be added to the OpenVBX inbox.  Once you can see sms messages in OpenVBX's inbox you'll be able to see conversations in the plugin.

## Configuration

- *Incoming Sound Notificaiton:* You can globally enable and disable incoming sound notifications from the plugin.json file by setting the property enable_sound_notification to true or false.

## Reporting Problems

If you experience issues with the plugin let us know by opening an issue report. [Click Here to Report a Problem](https://github.com/gegere/OpenVBX-Plugin-SMS-Conversation/issues)
