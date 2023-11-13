import EventInterface from "../../@shared/event/event.interface";
import Customer from "../entity/customer";

type EventData = {
  customer: Customer;
};

export default class CustomerAddressChangedEvent implements EventInterface {
  dataTimeOccurred: Date;
  eventData: EventData;

  constructor(eventData: EventData) {
    this.dataTimeOccurred = new Date();
    this.eventData = eventData;
  }
}
