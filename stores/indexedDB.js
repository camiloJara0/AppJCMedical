import { defineStore } from "pinia";

export const useIndexedDBStore = defineStore("indexeddb", {
    id: 'idexeddb',
    // state
    state: () => {
        return {
            bd: null,
            almacen: '',
            aguardar: {},
            respuesta: null,
            EXPECTED_VERSION: 1,
        };
    },
    actions: {
        async initialize() {
            return new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('db-ananke', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
                    const stores = [
                        'accesorios',
                        'actividades',
                        'categorias',
                        'citas',
                        'clientes',
                        'componentes',
                        'cotizacion_detalles',
                        'equipos',
                        'estado_componentes',
                        'materiales',
                        'mediciones',
                        'productos',
                        'reportes',
                        'repuestos',
                        'sistemas',
                        'solicitudes_cotizacions',
                        'tecnicos',
                        'tipo_equipos',
                        'tipo_equipo_sistemas',
                    ]

                    // Crear cada objectStore con su índice
                    stores.forEach(name => {
                        const store = db.createObjectStore(name, { keyPath: 'id' })
                        store.createIndex('buscaId', 'id', { unique: false })
                    })


                    // Tabla de versión
                    if (!db.objectStoreNames.contains("Version")) {
                        const versionStore = db.createObjectStore("Version", { keyPath: "id" });
                        versionStore.put({ id: 1, version: this.EXPECTED_VERSION });
                    }

                    // Tabla de control de actualizaciones
                    if (!db.objectStoreNames.contains("LastUpdate")) {
                        const updateStore = db.createObjectStore("LastUpdate", { keyPath: "store" });
                        // Insertar cada store con lastUpdated = 0 por defecto
                        stores.forEach(name => {
                            updateStore.put({ store: name, lastUpdated: 0 });
                        });
                    }

                }

                request.onerror = (event) => {
                    reject(event.target.errorCode)
                }

                request.onsuccess = (event) => {

                    this.bd = request.result
                    resolve(this.bd)
                }
            })

        },

        async leerdatos() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async necesitaRefrescar(storeName, limiteMs = 5 * 60 * 1000) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction("LastUpdate", "readonly");
            const store = tx.objectStore("LastUpdate");
            const req = store.get(storeName);

            return new Promise(resolve => {
                req.onsuccess = () => {
                    const info = req.result;
                    const ahora = Date.now();
                    resolve(!info || (ahora - info.lastUpdated) > limiteMs);
                };
            });
        },

        async guardardatos(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            let transaccion = this.bd.transaction(this.almacen, "readwrite");
            let STabre = transaccion.objectStore(this.almacen);
            STabre.add(aguardar);
        },

        async guardardatosID(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction(this.almacen, 'readwrite');
            const store = tx.objectStore(this.almacen);

            const limpio = JSON.parse(JSON.stringify(aguardar));

            const result = await new Promise((resolve, reject) => {
                const request = store.add(limpio);
                request.onsuccess = () => resolve(request.result); // El ID generado
                request.onerror = () => reject(request.error);
            });

            await tx.done;
            return result;
        },

        async leerpordato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.get(key)
                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

        },

        async borrardato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.delete(key)

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve()
                }
            })
        },

        async actualiza(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.put(aguardar)

                request.onerror = function () {
                    reject('error al actualizar')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async bulkPut(datos = []) {
            if (!this.bd) {
                await this.initialize();
            }

            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                for (const item of datos) {
                    // limpiar datos para evitar DataCloneError
                    const limpio = JSON.parse(JSON.stringify(item));
                    STlee.put(limpio);
                }

                transaccion.oncomplete = () => resolve(true);
                transaccion.onerror = (event) => reject(event.target.error);
            });
        },

        async borrartodo() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.clear()

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve();
                }
            })
        },

        async borra_lee(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return await borrardato(key).then(() => {
                return leerdatos()
            })
        },

        async buscar_no_enviados() {
            this.almacen = 'HistoriaClinica'
            let datos = await this.leerdatos()
            return datos.map(dato => dato.id === null)
        },

        async deleteDatabase(dbName) {
            if (this.bd) {
                this.bd.close();
                this.bd = null;
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName);

                request.onsuccess = () => {
                    console.log(`✅ Base de datos '${dbName}' eliminada correctamente.`);
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error(`❌ Error al eliminar la base de datos '${dbName}':`, event);
                    reject(event);
                };

                request.onblocked = () => {
                    console.warn(`⚠️ La eliminación de '${dbName}' está bloqueada. Cierra otras pestañas que usen esta base.`);
                };
            });
        },

        async clearDatabase(dbName) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(db.objectStoreNames, "readwrite");

                    transaction.oncomplete = () => {
                        console.log(`✅ Base de datos '${dbName}' limpiada correctamente.`);
                        resolve(true);
                    };

                    transaction.onerror = (event) => {
                        console.error(`❌ Error al limpiar la base de datos '${dbName}':`, event);
                        reject(event);
                    };

                    // Limpiar cada objectStore
                    for (const storeName of db.objectStoreNames) {
                        const store = transaction.objectStore(storeName);
                        if (storeName !== 'Version') store.clear();
                    }
                };

                request.onerror = (event) => {
                    console.error(`❌ Error al abrir la base de datos '${dbName}':`, event);
                    reject(event);
                };
            });
        },

        async validateVersion(dbName) {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains("Version")) {
                        db.close();
                        resolve(false); // no existe la tabla
                        return;
                    }

                    const tx = db.transaction("Version", "readonly");
                    const store = tx.objectStore("Version");
                    const getReq = store.get(1);

                    getReq.onsuccess = () => {
                        const record = getReq.result;
                        db.close();
                        if (record && record.version === this.EXPECTED_VERSION) {
                            resolve(true); // versión correcta
                        } else {
                            resolve(false); // versión incorrecta
                        }
                    };

                    getReq.onerror = () => {
                        db.close();
                        reject(getReq.error);
                    };
                };

                request.onerror = (event) => reject(event.target.errorCode);
            });
        }


    }
})