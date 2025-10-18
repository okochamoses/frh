import { google } from "googleapis";
import {randomUUID} from "crypto";

class Repository<Model> {
  // Static map to store instances for each subclass
  static instances: Map<string, any> = new Map();
  private readonly sheetName: string;
  private readonly spreadsheetId: any;
  private readonly hasHeaders: boolean;
  private readonly headerRow: number;
  private _headers: null;
  private _sheetsClient: null;

  constructor(sheetName, options = {
    spreadsheetId: undefined,
    hasHeaders: undefined,
    headerRow: 1
  }) {
    this.sheetName = sheetName;
    this.spreadsheetId = options.spreadsheetId || process.env.GOOGLE_SHEET_ID;
    this.hasHeaders = options.hasHeaders !== false;
    this.headerRow = options.headerRow || 1;
    this._headers = null;
    this._sheetsClient = null;

    // Get the constructor name to use as key for singleton pattern
    const className = this.constructor.name;

    // If instance already exists for this class, return it
    if (Repository.instances.has(className)) {
      return Repository.instances.get(className);
    }

    // Store this instance
    Repository.instances.set(className, this);
  }

  // Static method that works for any inheriting class
  static getInstance(...args) {
    const className = this.name;

    if (!Repository.instances.has(className)) {
      Repository.instances.set(className, new this(...args));
    }

    return Repository.instances.get(className);
  }

  // Method to reset instance (useful for testing)
  static resetInstance() {
    const className = this.name;
    Repository.instances.delete(className);
  }

  // Reset all instances (useful for testing)
  static resetAllInstances() {
    Repository.instances.clear();
  }

  async getSheetsClient() {
    if (this._sheetsClient) {
      return this._sheetsClient;
    }

    const credentials = {
      "type": "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_PROJECT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/frh-964%40flourish-roots-hair.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };

    const auth = google.auth.fromJSON(credentials);
    auth.scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    this._sheetsClient = google.sheets({ version: "v4", auth });
    return this._sheetsClient;
  }

  async getHeaders() {
    if (!this.hasHeaders) {
      throw new Error("Sheet is configured without headers");
    }

    if (this._headers) {
      return this._headers;
    }

    const sheets = await this.getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!${this.headerRow}:${this.headerRow}`,
    });

    this._headers = response.data.values?.[0] || [];
    return this._headers;
  }

  async getColumnIndex(colName) {
    if (!this.hasHeaders) {
      throw new Error("Column names require headers to be enabled");
    }

    const headers = await this.getHeaders();
    const index = headers.indexOf(colName);
    if (index === -1) {
      throw new Error(`Column '${colName}' not found in headers: ${headers.join(', ')}`);
    }
    return index;
  }

  columnIndexToLetter(index) {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode(65 + (index % 26)) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }

  rowToObject(row, headers) {
    if (!headers || !this.hasHeaders) {
      return row;
    }

    const obj = { _rowIndex: null }; // Will be set by calling methods
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  }

  objectToRow(obj, headers) {
    if (!headers || !this.hasHeaders) {
      return Array.isArray(obj) ? obj : Object.values(obj);
    }

    return headers.map(header => obj[header] || '');
  }

  // CORE CRUD OPERATIONS

  async findAll(options = {}): Promise<[Model]> {
    const sheets = await this.getSheetsClient();
    const startRow = this.hasHeaders ? this.headerRow + 1 : 1;
    const range = options.range || `${this.sheetName}!A${startRow}:Z`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: range,
    });

    const rows = response.data.values || [];

    if (!this.hasHeaders) {
      return rows.map((row, index) => ({ ...row, _rowIndex: startRow + index }));
    }

    const headers = await this.getHeaders();
    return rows.map((row, index) => {
      const obj = this.rowToObject(row, headers);
      obj._rowIndex = startRow + index;
      return obj;
    });
  }

  async findOne(id, options = {}) {
    const idColumn = options.idColumn || (this.hasHeaders ? await this.getHeaders()[0] : 0);
    const results = await this.find(idColumn, id);
    return results.length > 0 ? results[0] : null;
  }

  async findOne(data: {}, options = {}) {
    const results = await this.find(Object.keys(data)[0], Object.values(data)[0]);
    return results.length > 0 ? results[0] : null;
  }

  async find(colName, value, options = {}): Promise<Model> {
    const all = await this.findAll();
    const results = [];

    for (const item of all) {
      let itemValue;
      if (this.hasHeaders) {
        itemValue = item[colName];
      } else {
        // If no headers, colName should be column index
        itemValue = item[colName];
      }

      // Support different comparison modes
      const compareMode = options.compareMode || 'exact';
      let match = false;

      switch (compareMode) {
        case 'exact':
          match = itemValue === value;
          break;
        case 'contains':
          match = itemValue && itemValue.toString().includes(value.toString());
          break;
        case 'startsWith':
          match = itemValue && itemValue.toString().startsWith(value.toString());
          break;
        case 'regex':
          match = itemValue && new RegExp(value).test(itemValue.toString());
          break;
        default:
          match = itemValue === value;
      }

      if (match) {
        results.push(item);
      }
    }

    return results;
  }

  async create(data: Model) {
    const sheets = await this.getSheetsClient();
    let values;

    console.log(data)

    if (this.hasHeaders) {
      const headers = await this.getHeaders();
      const defaults = {id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()};
      values = [this.objectToRow({...data, ...defaults}, headers)];
    } else {
      values = [Array.isArray(data) ? data : Object.values(data)];
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    // Get the newly created row
    const updatedRange = response.data.updates.updatedRange;
    const rowNumber = parseInt(updatedRange.split(':')[0].match(/\d+/)[0]);

    if (this.hasHeaders) {
      const headers = await this.getHeaders();
      const result = this.rowToObject(values[0], headers);
      result._rowIndex = rowNumber;
      return result;
    }

    return { ...values[0], _rowIndex: rowNumber };
  }

  async update(colName, value, updateData, options = {}) {
    const items = await this.find(colName, value, options);

    if (items.length === 0) {
      if (options.upsert) {
        return await this.create(updateData);
      }
      throw new Error(`No records found with ${colName} = ${value}`);
    }

    if (items.length > 1 && !options.updateAll) {
      throw new Error(`Multiple records found with ${colName} = ${value}. Use updateAll: true to update all.`);
    }

    const sheets = await this.getSheetsClient();
    const updated = [];

    for (const item of items) {
      const rowIndex = item._rowIndex;
      let newData;

      if (this.hasHeaders) {
        // Merge existing data with updates
        const merged = { ...item, ...updateData };
        delete merged._rowIndex; // Remove internal field
        const headers = await this.getHeaders();
        newData = this.objectToRow(merged, headers);
      } else {
        newData = Array.isArray(updateData) ? updateData : Object.values(updateData);
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [newData],
        },
      });

      if (this.hasHeaders) {
        const headers = await this.getHeaders();
        const result = this.rowToObject(newData, headers);
        result._rowIndex = rowIndex;
        updated.push(result);
      } else {
        updated.push({ ...newData, _rowIndex: rowIndex });
      }
    }

    return options.updateAll || items.length === 1 ? updated : updated[0];
  }

  async delete(colName, value, options = {}) {
    const items = await this.find(colName, value, options);

    if (items.length === 0) {
      return 0;
    }

    if (items.length > 1 && !options.deleteAll) {
      throw new Error(`Multiple records found with ${colName} = ${value}. Use deleteAll: true to delete all.`);
    }

    const sheets = await this.getSheetsClient();

    // Sort by row index descending to avoid index shifting issues
    const sortedItems = items.sort((a, b) => b._rowIndex - a._rowIndex);

    for (const item of sortedItems) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Assumes first sheet, you might want to make this configurable
                dimension: 'ROWS',
                startIndex: item._rowIndex - 1, // 0-based index
                endIndex: item._rowIndex
              }
            }
          }]
        }
      });
    }

    return items.length;
  }

  // ADDITIONAL USEFUL OPERATIONS

  async count(colName = null, value = null) {
    if (!colName && !value) {
      const all = await this.findAll();
      return all.length;
    }

    const results = await this.find(colName, value);
    return results.length;
  }

  async exists(colName, value) {
    const count = await this.count(colName, value);
    return count > 0;
  }

  async findWhere(conditions) {
    const all = await this.findAll();

    return all.filter(item => {
      return Object.entries(conditions).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async updateWhere(conditions, updateData) {
    const items = await this.findWhere(conditions);

    if (items.length === 0) {
      return [];
    }

    const sheets = await this.getSheetsClient();
    const updated = [];

    for (const item of items) {
      const rowIndex = item._rowIndex;
      let newData;

      if (this.hasHeaders) {
        const merged = { ...item, ...updateData };
        delete merged._rowIndex;
        const headers = await this.getHeaders();
        newData = this.objectToRow(merged, headers);
      } else {
        newData = Array.isArray(updateData) ? updateData : Object.values(updateData);
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [newData],
        },
      });

      if (this.hasHeaders) {
        const headers = await this.getHeaders();
        const result = this.rowToObject(newData, headers);
        result._rowIndex = rowIndex;
        updated.push(result);
      } else {
        updated.push({ ...newData, _rowIndex: rowIndex });
      }
    }

    return updated;
  }

  async deleteWhere(conditions) {
    const items = await this.findWhere(conditions);

    if (items.length === 0) {
      return 0;
    }

    const sheets = await this.getSheetsClient();

    // Sort by row index descending to avoid index shifting issues
    const sortedItems = items.sort((a, b) => b._rowIndex - a._rowIndex);

    for (const item of sortedItems) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // You might want to make this configurable
                dimension: 'ROWS',
                startIndex: item._rowIndex - 1,
                endIndex: item._rowIndex
              }
            }
          }]
        }
      });
    }

    return items.length;
  }

  async clear() {
    const sheets = await this.getSheetsClient();
    const startRow = this.hasHeaders ? this.headerRow + 1 : 1;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A${startRow}:Z`,
    });
  }

  async getDistinct(colName) {
    const all = await this.findAll();
    const values = new Set();

    for (const item of all) {
      const value = this.hasHeaders ? item[colName] : item[colName];
      if (value !== undefined && value !== '') {
        values.add(value);
      }
    }

    return Array.from(values);
  }

  async paginate(page = 1, limit = 10) {
    const all = await this.findAll();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: all.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(all.length / limit),
        totalItems: all.length,
        itemsPerPage: limit,
        hasNext: endIndex < all.length,
        hasPrev: page > 1
      }
    };
  }
}

export default Repository;