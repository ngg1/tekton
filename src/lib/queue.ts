// Queue class 
export class Queue {
  data;

  constructor() {
    // Array is used to implement a Queue
    this.data = [];
  }

  get size() {
    return this.data.length;
  }

  // Adds an element to last pos of  queue
  enqueue(item) {
    this.data.push(item);
  }
  // removing element from the queue 
  dequeue() {
    if (this.isEmpty()) 
      throw new Error("Q is empty");
    
    return this.data.shift();
  }

  front() {
    // returns the Front element of  
    // the queue without removing it. 
    if (this.isEmpty())
      throw new Error("Q is empty");

    return this.data[0];
  }

  // isEmpty function 
  isEmpty() {
    // return true if the queue is empty. 
    return this.size === 0;
  }
}