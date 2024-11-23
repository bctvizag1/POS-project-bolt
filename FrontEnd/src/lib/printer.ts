import { Sale, SaleItem } from '../types';
import toast from 'react-hot-toast';

export class ReceiptPrinter {
  private encoder: TextEncoder;
  private port: SerialPort | null = null;

  constructor() {
    this.encoder = new TextEncoder();
  }

  private async connectToPrinter(): Promise<SerialPort> {
    if (!('serial' in navigator)) {
      throw new Error('Your browser does not support thermal printer connection. Please use Chrome or Edge.');
    }

    try {
      // Request port access
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.port = port;
      return port;
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        throw new Error('No printer was selected. Please try again and select your thermal printer.');
      } else {
        throw new Error('Failed to connect to the printer. Please check if it\'s properly connected.');
      }
    }
  }

  private formatReceipt(items: SaleItem[], total: number): string {
    const date = new Date().toLocaleString();
    const header = [
      '\x1B\x40',  // Initialize printer
      '\x1B\x61\x01',  // Center alignment
      'Modern POS System\n',
      '================================\n',
      `Date: ${date}\n\n`,
      '\x1B\x61\x00',  // Left alignment
    ].join('');

    const itemsList = items.map(item => 
      `${item.product_name}\n` +
      `  ${item.quantity} x $${item.price.toFixed(2)}` +
      `  $${(item.quantity * item.price).toFixed(2)}\n`
    ).join('\n');

    const footer = [
      '\n================================\n',
      `TOTAL: $${total.toFixed(2)}\n\n`,
      '\x1B\x61\x01',  // Center alignment
      'Thank you for your purchase!\n\n\n\n',
      '\x1B\x64\x04',  // Feed 4 lines
      '\x1B\x69',  // Cut paper
    ].join('');

    return header + itemsList + footer;
  }

  async printReceipt(sale: { items: SaleItem[]; total: number }): Promise<boolean> {
    try {
      const port = await this.connectToPrinter();
      const writer = port.writable.getWriter();
      
      toast.loading('Printing receipt...');
      const receipt = this.formatReceipt(sale.items, sale.total);
      
      await writer.write(this.encoder.encode(receipt));
      writer.releaseLock();
      await port.close();
      
      toast.success('Receipt printed successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to print receipt');
      throw error;
    }
  }

  async disconnect() {
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
      } catch (error) {
        console.error('Error disconnecting printer:', error);
      }
    }
  }
}