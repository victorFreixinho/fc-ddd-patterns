import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerCreated1Handler from "./handler/customer-created.1.handler";
import CustomerCreated2Handler from "./handler/customer-created.2.handler";

describe("Customer created event tests", () => {
  beforeEach(() => {
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.unregisterAll();
  });

  it("should notify all event handlers on customer creation", () => {
    const eventDispatcher = new EventDispatcher();

    const eventName = CustomerCreatedEvent.name;

    const eventHandler1 = new CustomerCreated1Handler();
    eventDispatcher.register(eventName, eventHandler1);
    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");

    const eventHandler2 = new CustomerCreated2Handler();
    eventDispatcher.register(eventName, eventHandler2);
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(
      eventHandler1
    );
    expect(eventDispatcher.getEventHandlers[eventName][1]).toMatchObject(
      eventHandler2
    );

    const customer = new Customer("1", "Customer 1");

    expect(spyEventHandler1).toHaveBeenCalledTimes(1);
    expect(spyEventHandler2).toHaveBeenCalledTimes(1);
  });
});
