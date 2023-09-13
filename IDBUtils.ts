export class IDBUtils {
  dbName: string | undefined;
  version: number | undefined;
  onupgradeneeded: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any) | undefined;
  db: IDBDatabase | undefined;
  constructor(
    dbName: string,
    version?: number,
    onupgradeneeded?: (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any,
  ) {
    this.dbName = dbName;
    this.version = version;
    this.onupgradeneeded = onupgradeneeded;
  }

  openDB(fn?: Function) {
    if (!this.dbName) return console.log("dbName不存在");

    return new Promise(resolve => {
      if (this.db) return;

      const request = indexedDB.open(this.dbName as string, this.version);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => {
        console.log("打开数据库失败");
      };
      const onupgradeneeded = this.onupgradeneeded;
      request.onupgradeneeded = function (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent): any {
        onupgradeneeded?.call(this, ev);
        fn?.call(this, ev);
      };
    });
  }

  createObjectStore(
    storeName: string,
    keyConfig?: IDBObjectStoreParameters | undefined,
    indexConfig?: { name: string; keyPath: string | string[]; options?: IDBIndexParameters | undefined },
  ) {
    this.openDB((ev: any) => {
      const objectStore = ev.target?.result?.createObjectStore(storeName, keyConfig);
      if (indexConfig) objectStore?.createIndex(indexConfig.name, indexConfig.keyPath, indexConfig.options);
    });
  }

  getObjectStore(storeName: string) {
    return this.db?.transaction(storeName, "readwrite").objectStore(storeName);
  }
  put(storeName: string, data: any) {
    this.openDB()
      ?.then(() => this.getObjectStore(storeName)?.put(data))
      .catch(error => console.log(error));
  }

  get(storeName: string, key: any) {
    return new Promise(resolve => {
      this.openDB()
        ?.then(() => {
          const request = this.getObjectStore(storeName)?.get(key);
          if (!request) return; //onFulfilled拿到的值是空
          request.onsuccess = () => {
            resolve(request.result);
          };
        })
        .catch(error => console.log(error));
    });
  }

  getAll(storeName: string) {
    return new Promise(resolve => {
      this.openDB()
        ?.then(() => {
          const request = this.getObjectStore(storeName)?.getAll();
          if (!request) return;
          request.onsuccess = () => {
            resolve(request.result);
          };
        })
        .catch(error => console.log(error));
    });
  }

  cursor(storeName: string, fn: Function) {
    return new Promise(() => {
      this.openDB()
        ?.then(() => {
          const request = this.getObjectStore(storeName)?.openCursor();
          if (!request) return;
          request.onsuccess = () => {
            fn(request.result?.value);
            request.result?.continue();
          };
        })
        .catch(error => console.log(error));
    });
  }
  getByIndex(storeName: string, indexName: string, indexValue: any) {
    return new Promise(resolve => {
      this.openDB()
        ?.then(() => {
          const request = this.getObjectStore(storeName)?.index(indexName).get(indexValue);
          if (!request) return;
          request.onsuccess = () => {
            resolve(request.result);
          };
        })
        .catch(error => console.log(error));
    });
  }

  delete(storeName: string, key: any) {
    this.openDB()
      ?.then(() => this.getObjectStore(storeName)?.delete(key))
      .catch(error => console.log(error));
  }

  closeDB() {
    if (!this.db) return console.log("db不存在");
    this.db.close();
  }

  deleteObjectStore(storeName: string) {
    this.openDB((event: any) => {
      console.log("hi");
      event.target.result.deleteObjectStore(storeName);
    });
  }
  static deleteDB(dbName: string) {
    const request = indexedDB.deleteDatabase(dbName); //第二个参数是版本号，可选
    request.onsuccess = function () {
      console.log("数据库已成功删除");
    };
    request.onerror = function () {
      console.error("删除数据库出错");
    };
    request.onblocked = function () {
      console.error("数据库删除被阻止");
    };
  }
}
