# Chrome Addon v3 Starter
This repository contains the minimal boilerplate code needed to start developing a chrome/chromium extension that uses the newest version of the manifest (v3).
In other words, this is a **working "v3" extension** that does nothing but **can be installed and modified** to create a real extension.

If you tried to create such an extension or to port a v2 extension to v3, you know that the current documentation is lacking some crucial information.
This repository will help you jumpstart the creation of your extension, or give you more insights about how to turn you v2 extension into a working v3 one.

## Installation
- Clone this repo anywhere on your computer.
- Open [the extensions page](chrome://extensions) in your browser: chrome://extensions. This link works on any chromium-based browser.
- If you did not do it already, toggle the "developer mode". This is usually a toggle at the top right of the extensions page.
- Click the button "load unpacked extension".
- In the window that pops up, select the folder that contains this repo, then click ok.
- A new extension called "Chrome Addon v3 Starter" should have appeared in the list.

## Q&A
> Does this work only on Chrome or on other web browsers as well?
At the moment, this works on every chromium-based web browser that supports v3 extensions.
Therefore, you should be able to install this extension on any of the following browsers (as long as they are up-to-date):
- Chrome
- Chromium
- Brave
- Edge
- Vivaldi

> So it doesn't work on Firefox?
No, Firefox uses a different extension format. That being said, it shouldn't be too hard to port your extension over to it.

> I don't need a popup tool for my extension! Can I remove it?
Yes, simply delete the `popup` folder and remove the `default_popup` property from the manifest.

> I changed some code in the extension, but my changes aren't taken into accout!
For most of the changes you make, you will need to reload your extension for the changes to be applied.
To do that, go to the chrome://extensions page and click the reload button of your extension.
Note that most of the changes you will make to the settings page or the popup don't require reloading the extension.

## External resources
- [Official feature summary for manifest v3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/)
- [Migrating from v2 to v3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/) + [very useful checklist once you think you are done](https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/)
- [Excellent write-ups of a migration](https://github.com/kentbrew/learning-manifest-v3)
- [Another example of a v3 extension (older code)](https://gist.github.com/dotproto/3a328d6b187621b445499ba503599dc0)
