import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }

  transform(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // 1. Handle BigInt
    if (typeof data === 'bigint') {
      return data.toString();
    }

    // 2. Handle Date (Prevent destruction by recursion)
    if (data instanceof Date) {
      return data.toISOString();
    }

    // 3. Handle Prisma Decimal / Decimal.js (Duck typing check)
    if (typeof data === 'object' && 
        data.d && Array.isArray(data.d) && 
        (typeof data.toFixed === 'function' || typeof data.toNumber === 'function')) {
      return typeof data.toNumber === 'function' ? data.toNumber() : Number(data.toString());
    }

    // 4. Handle Arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    }

    // 5. Handle Objects (Recursive)
    if (typeof data === 'object' && data !== null) {
      // If it's a Buffer or other built-in type we missed, we might still have issues, 
      // but for DB results this covers 99% of cases.
      const transformed: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          transformed[key] = this.transform(data[key]);
        }
      }
      return transformed;
    }

    return data;
  }
}
