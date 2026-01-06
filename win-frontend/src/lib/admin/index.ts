/**
 * Centralizador de todos os services de administração
 * Importar daqui para garantir consistência
 */

// Base
export { AdminApi, api } from "./AdminApi";

// Services específicos
export { userApi } from "./UserApi";
export { storeApi } from "./StoreApi";
export { orderApi } from "./OrderApi";
export { productApi } from "./ProductApi";
export { dashboardApi } from "./DashboardApi";
export { deliveryApi } from "./DeliveryApi";
export { financeApi } from "./FinanceApi";

// Types - User
export type {
  User,
  UserFormatted,
  UserStats,
} from "./UserApi";

// Types - Store
export type {
  Store,
  StoreFormatted,
  StoreStats,
} from "./StoreApi";

// Types - Order
export type {
  Order,
  OrderFormatted,
  OrderStats,
} from "./OrderApi";

// Types - Product
export type {
  Product,
  ProductFormatted,
  ProductStats,
} from "./ProductApi";

// Types - Dashboard
export type {
  DashboardStats,
  RecentOrder,
  RecentStore,
  ChartData,
} from "./DashboardApi";

// Types - Delivery
export type {
  EntregaStats,
  EntregaListItem,
  StatusEntrega,
} from "./DeliveryApi";
