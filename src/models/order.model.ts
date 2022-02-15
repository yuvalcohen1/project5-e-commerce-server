export interface OrderModel {
  _id?: string;
  userId: string;
  cartId: string;
  finalPrice: number;
  cityForShipping: string;
  streetForShipping: string;
  shippingDate: Date;
  orderingDate: Date;
  fourLastDigitsOfPayment: number;
}
