# Order Management System (OMS)

## Thought Process / System Design

- Initially I thought of using kafka for the queue but later realized that it is an overkill for this simple system and also doesn't add any value when the requestType is 'Modify' and 'Cancel'.

- So I decided to use a simple queue for storing the orderIds and map for storing the order details. This way I can modify the order details in O(1) time complexity, in map when I have 'Modify' and 'Cancel' requestType.

- As Nodejs is single threaded, I didn't have to explicitly handle multithreading, it is handled by the event loop, it offloads the tasks which requires time to the ThreadPool(Which eventually uses multiple threads).

- I had to use few libraries like express for handling the http requests(I can do it in nodejs too, but had to write lot of boilerplate code), uuid for generating the unique orderIds and jest for testing.

- I have written test cases for testing the APIs. Can be run using `npm test`.

## Assumptions

I have few assumptions for this system:

- I am assuming that the orderIds are unique and used uuid for generating the orderIds.
- I am assuming that there will be an organization and action field in the request body.
- I am assuming responseTypes are 'sold' and 'bought' only.

## Deployment

- Render : https://omspipeshub.onrender.com

## API Endpoints

- POST /order : To create an order
- Request Body:

```
{
    "quantity": 10,
    "price": 100,
    "organization": "mrf",
    "action": "buy"
}
```

- POST /responseType : This will be the api where the exChange will send the response to the OMS.
- Request Body:

```
{
    "orderId": "1",
    "responseType": "sold"
}
```
