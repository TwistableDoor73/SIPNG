export interface ApiResponse<T = any> {
  statusCode: number;
  intOpCode: string;
  data: T;
}

export function createResponse<T>(
  statusCode: number,
  intOpCode: string,
  data: T
): ApiResponse<T> {
  return {
    statusCode,
    intOpCode,
    data,
  };
}

export const OP_CODES = {
  // User operations
  SxUS200: 'User login successful',
  SxUS201: 'User registered successfully',
  SxUS400: 'Invalid user credentials',
  SxUS401: 'Unauthorized',
  SxUS403: 'Forbidden - insufficient permissions',
  SxUS404: 'User not found',

  // Ticket operations
  SxTK200: 'Ticket retrieved successfully',
  SxTK201: 'Ticket created successfully',
  SxTK400: 'Invalid ticket data',
  SxTK404: 'Ticket not found',

  // Group operations
  SxGP200: 'Group retrieved successfully',
  SxGP201: 'Group created successfully',
  SxGP400: 'Invalid group data',
  SxGP404: 'Group not found',

  // Generic
  SxGN500: 'Internal server error',
  SxGN408: 'Request timeout',
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public intOpCode: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
