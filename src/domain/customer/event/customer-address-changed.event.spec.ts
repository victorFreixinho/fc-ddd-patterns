import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import CustomerAddressChangedHandler from "./handler/customer-address-changed.handler";

describe("Customer address changed event tests", () => {
  beforeEach(() => {
    const eventDispatcher = new EventDispatcher();
    eventDispatcher.unregisterAll();
  });

  it("should notify all event handlers on customer address change", () => {
    const eventDispatcher = new EventDispatcher();

    const eventName = CustomerAddressChangedEvent.name;

    const eventHandler = new CustomerAddressChangedHandler();
    eventDispatcher.register(eventName, eventHandler);
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    expect(eventDispatcher.getEventHandlers[eventName][0]).toMatchObject(
      eventHandler
    );
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "State 1", "Country 1");
    customer.changeAddress(address);

    expect(spyEventHandler).toHaveBeenCalledTimes(1);
  });
});
