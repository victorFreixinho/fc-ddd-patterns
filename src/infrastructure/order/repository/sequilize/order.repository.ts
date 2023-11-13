import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.findOne({
      where: {
        id: entity.id,
      },
      include: ["items"],
    }).then(async (orderFound) => {
      if (orderFound) {
        const addedItems = entity.items.filter(
          (item) =>
            !orderFound.items.some((entityItem) => entityItem.id === item.id)
        );
        const removedItems = orderFound.items.filter(
          (entityItem) =>
            !entity.items.some((item) => item.id === entityItem.id)
        );
        const updatedItems = entity.items.filter((item) =>
          orderFound.items.some((entityItem) => entityItem.id === item.id)
        );

        const addedModelItems = await Promise.all(
          addedItems.map((item) =>
            OrderItemModel.create({
              id: item.id,
              product_id: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              order_id: entity.id,
            })
          )
        );
        const updatedModelItems = await Promise.all(
          updatedItems.map((item) =>
            OrderItemModel.update(
              {
                product_id: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              },
              { where: { id: item.id } }
            ).then(() => OrderItemModel.findOne({ where: { id: item.id } }))
          )
        );

        await Promise.all(
          removedItems.map((item) =>
            OrderItemModel.destroy({ where: { id: item.id } })
          )
        );
        orderFound.items = [...updatedModelItems, ...addedModelItems];
        orderFound.total = entity.total();
        await orderFound.save();
      }
    });
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: ["items"],
    });
    return new Order(
      orderModel.id,
      orderModel.customer_id,
      orderModel.items.map(
        (orderItemModel) =>
          new OrderItem(
            orderItemModel.id,
            orderItemModel.name,
            orderItemModel.price,
            orderItemModel.product_id,
            orderItemModel.quantity
          )
      )
    );
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: ["items"] });
    return orderModels.map(
      (orderModel) =>
        new Order(
          orderModel.id,
          orderModel.customer_id,
          orderModel.items.map(
            (orderItemModel) =>
              new OrderItem(
                orderItemModel.id,
                orderItemModel.name,
                orderItemModel.price,
                orderItemModel.product_id,
                orderItemModel.quantity
              )
          )
        )
    );
  }
}
