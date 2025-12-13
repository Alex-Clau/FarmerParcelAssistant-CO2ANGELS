/**
 * Message Format Schemas
 * Defines request and response formats for message endpoints
 * Enforced in the app via other means: express-validator, consistent request/response/error formats
 */

/**
 * Message Request Schema
 * @typedef {Object} MessageRequest
 * @property {string} from - Phone number (9-20 characters)
 * @property {string} text - Message text content
 */
const MessageRequest = {
  type: 'object',
  required: ['from', 'text'],
  properties: {
    from: {
      type: 'string',
      minLength: 9,
      maxLength: 20,
      description: 'Phone number of the sender',
      example: '+1234567890'
    },
    text: {
      type: 'string',
      description: 'Message text to be parsed and processed',
      example: 'Show me my parcels'
    }
  }
};

/**
 * Message Response Schema (Success)
 * @typedef {Object} MessageResponse
 * @property {string} reply - Response message to the user
 */
const MessageResponse = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'Response message to the user',
      example: 'You have 2 parcels:\n P1 - North Field (10.5 ha, Wheat)\n P2 - South Field (8.2 ha, Corn)'
    }
  },
  required: ['reply']
};

/**
 * Report Generation Response Schema
 * @typedef {Object} ReportMessage
 * @property {string} to - Phone number to send report to
 * @property {string} message - Report message content
 */
const ReportGenerationResponse = {
  type: 'array',
  description: 'Array of generated reports to be sent',
  items: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Phone number to send report to',
        example: '+1234567890'
      },
      message: {
        type: 'string',
        description: 'Report message content',
        example: 'Your weekly parcel report: \nFor parcel P1: \nNDVI is Good, indicating healthy, dense vegetation.'
      }
    },
    required: ['to', 'message']
  },
  example: [
    {
      to: '+1234567890',
      message: 'Your weekly parcel report: \nFor parcel P1: \nNDVI is Good...'
    }
  ]
};

/**
 * Error Response Schema
 * @typedef {Object} ErrorResponse
 * @property {string} message - Error message
 * @property {number} code - HTTP status code
 */
const ErrorResponse = {
  type: 'object',
  properties: {
    message: {
      type: 'string',
      description: 'Error message',
      example: 'Invalid request. Please provide a valid phone number (from) and message (text).'
    },
    code: {
      type: 'number',
      description: 'HTTP status code',
      example: 400
    }
  },
  required: ['message']
};

module.exports = {
  MessageRequest,
  MessageResponse,
  ErrorResponse,
  ReportGenerationResponse
};