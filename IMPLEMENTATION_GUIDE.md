# YaSale Backend - Street Food Kitchen SaaS

## 📋 Proyecto Completo

Este backend está diseñado para soportar un sistema SaaS multi-tenant para puestos de comida callejera. El schema de Prisma está completo y listo para usar.

## 🏗️ Arquitectura

### Base de Datos (✅ COMPLETO)

- **Prisma Schema**: `/prisma/schema.prisma`
- 17 modelos con relaciones completas
- Soporte multi-tenant
- Índices optimizados

### Módulos a Implementar

#### 1. Auth Module (`src/auth/`)

**Archivos necesarios:**

- `auth.module.ts`
- `auth.controller.ts` - POST /auth/pin-login, GET /auth/me
- `auth.service.ts` - Lógica de validación PIN (bcrypt)
- `jwt.strategy.ts` - Estrategia JWT
- `dto/pin-login.dto.ts`
- `guards/jwt-auth.guard.ts`
- `guards/roles.guard.ts`
- `decorators/current-user.decorator.ts`

**Lógica clave:**

```typescript
// PIN Login debe:
// 1. Buscar usuario por tenantId + PIN hasheado
// 2. Validar que tenant esté activo
// 3. Generar JWT con: userId, tenantId, role, storeIds
// 4. Retornar: token + user data + stores[]
```

#### 2. Tenants Module (`src/tenants/`)

- CRUD de tenants
- Validación de límites (maxStores, maxUsers)
- Integración con Stripe webhooks

#### 3. Users Module (`src/users/`)

- CRUD de usuarios
- Hash de PIN con bcrypt
- Asignación a stores (UserStore)
- Filtrado por tenant automático

#### 4. Stores Module (`src/stores/`)

- CRUD de tiendas
- Validar límite del plan
- Asignación de usuarios

#### 5. Menu Module (`src/menu/`)

**Sub-recursos:**

- Categories
- Products
- VariantGroups + VariantOptions
- ModifierGroups + ModifierOptions

**Endpoints:**

- GET /menu/:storeId - Menú completo con relaciones anidadas
- POST /menu/products
- PATCH /menu/products/:id
- DELETE /menu/products/:id

#### 6. Orders Module (`src/orders/`)

**Endpoints críticos:**

- POST /orders - Crear orden
- PATCH /orders/:id/start - Cambiar a IN_PROGRESS
- PATCH /orders/:id/ready - Cambiar a READY
- GET /orders/kitchen/:storeId - Cola de cocina (PENDING, IN_PROGRESS)

**Lógica de creación:**

```typescript
// 1. Generar número único de orden (auto-increment por store)
// 2. Calcular precios:
//    - basePrice del producto
//    - + priceModifier de variantes
//    - + price de modificadores tipo ADD
// 3. Crear OrderItems
// 4. Crear OrderItemModifiers
// 5. Emitir evento Socket.IO 'order.created'
// 6. Crear PrintJob (queued)
```

#### 7. Checks Module (`src/checks/`)

- POST /checks - Crear check abierto
- POST /checks/:id/add-order - Agregar orden a check
- POST /checks/:id/close - Cerrar y registrar pago + propina
- GET /checks/open/:storeId

#### 8. Reports Module (`src/reports/`)

- GET /reports/dashboard/:storeId?date=YYYY-MM-DD
- GET /reports/sales?from=&to=&storeId=
- Agregaciones: SUM(total), COUNT(orders), AVG(check.total)

#### 9. Socket Gateway (`src/socket/`)

**Rooms:**

- `tenant:{tenantId}`
- `store:{storeId}`

**Eventos a emitir:**

- `order.created` → Kitchen app
- `order.started` → Waiter app
- `order.ready` → Waiter app
- `check.paid` → Kitchen app (limpiar órdenes)

#### 10. Printing Service (Microservicio externo)

- Consumir RabbitMQ queue `print_jobs`
- Generar tickets ESC/POS
- Enviar a impresora térmica por IP
- Actualizar PrintJob.status

## 🔐 Guards y Decorators

### JwtAuthGuard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### RolesGuard

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### @CurrentUser() Decorator

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## 📦 Dependencias Necesarias

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install @nestjs/microservices amqplib
npm install stripe
npm install class-validator class-transformer
npm install --save-dev @types/bcrypt @types/passport-jwt
```

## 🚀 Pasos Siguientes

1. **Generar Prisma Client:**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

2. **Crear módulos con NestJS CLI:**

```bash
nest g module auth
nest g service auth
nest g controller auth
```

3. **Configurar Swagger en main.ts:**

```typescript
const config = new DocumentBuilder()
  .setTitle('YaSale API')
  .setDescription('Street Food Kitchen SaaS API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

4. **Variables de entorno (.env):**

```env
DATABASE_URL="mysql://user:password@localhost:3307/yasale"
JWT_SECRET="your-super-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RABBITMQ_URL="amqp://localhost:5672"
```

## 📝 DTOs con Class Validator

Ejemplo para crear orden:

```typescript
export class CreateOrderDto {
  @IsEnum(OrderType)
  type: OrderType;

  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsOptional()
  selectedVariants?: SelectedVariantDto[];

  @IsArray()
  @IsOptional()
  modifierIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
```

## 🎯 Prioridad de Implementación

1. ✅ Schema de Prisma (COMPLETO)
2. 🔄 Auth Module (crítico)
3. 🔄 Users Module
4. 🔄 Menu Module
5. 🔄 Orders Module + Socket
6. 🔄 Checks Module
7. 🔄 Reports Module
8. 🔄 Printing Service

## 📚 Documentación Adicional

- Prisma Docs: https://www.prisma.io/docs
- NestJS Docs: https://docs.nestjs.com
- Socket.IO: https://socket.io/docs/v4
- Stripe API: https://stripe.com/docs/api

---

**Nota**: El schema completo está listo. Ahora necesitas implementar los módulos siguiendo la arquitectura modular de NestJS con separación de responsabilidades (Controller → Service → Repository/Prisma).
