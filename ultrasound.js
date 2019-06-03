const xapi = require('xapi');

 // CE maximum value for Ultrasound's MaxVolume
 const MAX = 70; // 90 for a DX, and 70 for a RoomKit

 function updateUI(volume) {
   console.log(`updating UI to new Ultrasound configuration: ${volume}`);

   // Update text
   xapi.command('UserInterface Extensions Widget SetValue', {
       WidgetId: 'volume_text',
       Value: volume
   });
       
    //Update ON/OFF toggle
    if (volume > 0) {
      xapi.command('UserInterface Extensions Widget SetValue', {
       WidgetID: 'us_on_off',
       Value:"on"});
    }
       else {
      xapi.command('UserInterface Extensions Widget SetValue', {
       WidgetID: 'us_on_off',
       Value:"off"})
    
  }

   // Update slider
   const level = Math.round(parseInt(volume) * 255 / MAX);
   xapi.command('UserInterface Extensions Widget SetValue', {
       WidgetId: 'volume_slider',
       Value: level
   });
  
 }

 xapi.on('error', (err) => {
     console.error(`connexion failed: ${err}, exiting`);
     process.exit(1);
 });

 // Update UI on startup
 xapi.on('ready', () => {
     console.log('connection successful');

     // Initialize Widgets with current volume
     xapi.config.get('Audio Ultrasound MaxVolume').then((volume) => updateUI(volume));
 });

 // Update UI from configuration changes
 xapi.config.on('Audio Ultrasound MaxVolume', (volume) => updateUI(volume));

 // Update configuration from UI actions
 xapi.event.on('UserInterface Extensions Widget Action', (event) => {
   if (event.WidgetId !== 'volume_slider') return;
   if (event.Type !== 'changed') return;

   // Update Ultrasound configuration
   const volume = Math.round(parseInt(event.Value) * MAX / 255);
   console.log(`updating Ultrasound configuration to: ${volume}`);
   xapi.config.set('Audio Ultrasound MaxVolume', volume);
 });