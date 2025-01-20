

class OrderManagement {
    constructor(config) {
        this.sentOrders = new Map();
        this.isTradingPeriod = false;
        this.maxOrdersPerSecond = config.maxOrdersPerSecond || 100;
        this.tradingHours = config.tradingHours || { start: '10:00', end: '13:00' };
        this.kafkaProducer = config.kafkaProducer;
        this.kafkaConsumer = config.kafkaConsumer;

        this.initTradingPeriodChecker();
        this.startOrderProcessor();
    }

    initTradingPeriodChecker() {
        setInterval(() => {
            const now = new Date();
            const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
            if (currentTime === this.tradingHours.start && !this.isTradingPeriod) {
                this.isTradingPeriod = true;
                this.sendLogon();
            } else if (currentTime === this.tradingHours.end && this.isTradingPeriod) {
                this.isTradingPeriod = false;
                this.sendLogout();
            }
        }, 1000);
    }

    async startOrderProcessor() {
        let orderCount = 0;
        const interval = setInterval(() => {
            // Resetting
            orderCount = 0; 
        }, 1000);

        this.kafkaConsumer.run({
            eachMessage: async ({ message }) => {
                if (!this.isTradingPeriod) return;

                if (orderCount < this.maxOrdersPerSecond) {
                    const order = JSON.parse(message.value.toString());
                    await this.send(order);
                    this.sentOrders.set(order.m_orderId, Date.now());
                    orderCount++;
                } else {
                    console.log('Throttling: Too many orders, skipping this message for now.');
                }
            }
        });

        process.on('SIGINT', async () => {
            clearInterval(interval);
            await this.kafkaConsumer.disconnect();
        });
    }

    /**
     * @description This method is called when an order is received from the client.
     * @param {Object} request - The order request object.
     */
    async onDataOrder(request) {
        if (!this.isTradingPeriod) {
            return { status: 'rejected', reason: 'Outside trading period' };
        }

        await this.kafkaProducer.send({
            topic: 'order-requests',
            messages: [{ key: String(request.m_orderId), value: JSON.stringify(request) }]
        });

        return { status: 'queued', orderId: request.m_orderId };
    }

    /**
     * @description This method is called when a response is received from the exchange.
     * @param {Object} response - The response object.
     */
    onDataResponse(response) {
        const sentTime = this.sentOrders.get(response.m_orderId);

        if (sentTime) {
            const latency = Date.now() - sentTime;
            console.log(`Response for Order ${response.m_orderId}: ${response.responseType}, Latency: ${latency}ms`);
            this.sentOrders.delete(response.m_orderId);
            return { status: 'processed', orderId: response.m_orderId, latency };
        } else {
            return { status: 'not_found', reason: 'Order not found' };
        }
    }

    async send(order) {
        console.log(`Sending order to exchange: ${order.m_orderId}`);
    }

    async sendLogon() {
        console.log('Sending logon to exchange.');
    }

    async sendLogout() {
        console.log('Sending logout to exchange.');
    }
}

export default OrderManagement;