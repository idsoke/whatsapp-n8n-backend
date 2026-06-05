import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class N8nApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    if (!expectedSecret) {
      throw new UnauthorizedException('N8N_WEBHOOK_SECRET is not configured.');
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const headerValue = request.headers['x-n8n-api-key'];
    const actualSecret = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (actualSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid n8n API key.');
    }

    return true;
  }
}
