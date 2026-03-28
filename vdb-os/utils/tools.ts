import { FunctionDeclaration, Type } from '@google/genai';

export const TOOLS: FunctionDeclaration[] = [
  {
    name: 'open_application',
    description: 'Opens a specific application window within VDB Singularity OS.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            appName: {
                type: Type.STRING,
                description: 'The name of the app to open. Available apps: Terminal, Code Editor, Camera, Gallery, System Settings, Phone, Diagnostics, Contacts.',
            },
        },
        required: ['appName'],
    },
  },
   {
    name: 'generate_website',
    description: 'Generate a complete, single-file HTML/CSS/JS website. The AI should call this function with the raw HTML string which will then be displayed in the terminal.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        htmlContent: {
          type: Type.STRING,
          description: 'The complete HTML string including <style> and <script> tags.',
        },
        description: {
          type: Type.STRING,
          description: 'Short description of what was built.',
        },
      },
      required: ['htmlContent', 'description'],
    },
  },
  {
    name: 'take_photo',
    description: 'Captures a photo using the active camera.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'start_video_recording',
    description: 'Starts recording a video using the active camera.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'stop_video_recording',
    description: 'Stops the current video recording.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'flip_camera',
    description: 'Switches the camera between front and back-facing.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
   {
    name: 'switch_camera_mode',
    description: 'Switches the camera between different modes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: {
          type: Type.STRING,
          description: "The mode to switch to. Available modes: 'photo', 'video', 'qr scanner'",
        },
      },
      required: ['mode'],
    },
  },
  {
    name: 'get_battery_status',
    description: 'Get the current battery level and charging status of the device.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_current_location',
    description: "Get the user's current latitude, longitude, and accuracy using GPS.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'send_whatsapp_message',
    description: 'Sends a message to a contact via WhatsApp.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipient: {
          type: Type.STRING,
          description: 'The name or phone number of the person to message.',
        },
        message: {
          type: Type.STRING,
          description: 'The content of the message to send.',
        },
      },
      required: ['recipient', 'message'],
    },
  },
  {
    name: 'make_phone_call',
    description: 'Initiates a phone call to a specified number or contact name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phoneNumber: {
          type: Type.STRING,
          description: 'The phone number to dial. (Optional if contactName is provided)',
        },
        contactName: {
          type: Type.STRING,
          description: 'The name of the contact to call from the contacts list. (Optional if phoneNumber is provided)',
        },
      },
    },
  },
];
