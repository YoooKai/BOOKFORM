# Cómo hacer una pinche API en express usando estructura hexagonal.
Esta vaina usa typescript, prisma

Qué es vlidate, construsctor y todo eso, y asincronía, promesa, await,--


## Puntos clave:

Promesas:
🔹 Las promesas son como tareas que toman tiempo en completarse, como una consulta a la base de datos o una petición a una API.

🔹 Un método asíncrono (async) permite usar await para esperar a que termine una promesa antes de continuar.

🔹 Si no usas await, el código seguiría ejecutándose sin esperar la respuesta, lo que podría causar errores.

## Arquitectura


El código sigue un patrón de arquitectura en capas, dividiendo la lógica en distintas carpetas y responsabilidades:

- **Models (Modelos)** → Definen la estructura de los objetos que maneja la API.

- **Controllers (Controladores)** → Gestionan las solicitudes HTTP y envían respuestas.

- **Services (Servicios)** → Contienen la lógica de negocio.

- **Repository (Repositorios)** → Acceden a la base de datos.

- **Infrastructure (Infraestructura)** → Implementaciones concretas del repositorio (por ejemplo, usando Prisma).

## Flujo:

- Cliente->>Controlador: HTTP Request
- Controlador->>Servicio: Llama a execute()
- Servicio->>Repositorio: Consulta o guarda datos
- Repositorio->>BaseDeDatos: Accede a la base de datos
- BaseDeDatos->>Repositorio: Devuelve los datos
- Repositorio->>Servicio: Retorna datos
- Servicio->>Controlador: Responde con la información
- Controlador->>Cliente: HTTP Response

  
# MODELO

En primer lugar, vamos a centrarnos en los modelos. Usaré un ejemplo de de los más sencillos del proyecto que me dieron:

**AreaPrimitives.ts**

```ts
export interface AreaPrimitives {
    id:                      string,
    name:                    string,
    status:                  boolean
}
```
Esta interfaz exportable es una estructura que define qué propiedades debe tener 
el objeto y de qué tipo son, pero sin implementar lógica ni métodos.

Es útil para tipar datos y asegurar que los objetos sigan un formato específico.

**Area.ts**

```ts
import { Bool } from "../../Shared/Models/Bool";
import { Name } from "../../Shared/Models/Name";
import { Uuid } from "../../Shared/Models/Uuid";
import { AreaPrimitives } from "./AreaPrimitives";

export class Area {

    static fromPrimitives(data: AreaPrimitives): Area {
        const id = new Uuid(data.id);
        const name = new Name(data.name);
        const status = new Bool(data.status);

        return new Area(id, name, status);
    }

    constructor(
        public readonly id: Uuid,
        public readonly name: Name,
        public readonly status: Bool,
    ){}

    getPrimitives(): AreaPrimitives {
        return {
            id: this.id.value,
            name: this.name.value,
            status: this.status.value
        }
    }
}
```

En primer lugar están las importaciones:
Se imorta la interfaz del objeto que antes hablamos, y
otros archivos que  son clases encapsuladas de tipos de datos concretos, 
como Uuid, Name se refiere a String, etc... que ciertas validaciones de que se
trate de este tipo de dato. Hay unos cuantos, incluídos version opcional, llamándose NameOptional,
que es lo mismo que Name pero pudiendo ser null el dato.
Por ej:

**Shared/Model/Name.ts**

```ts
import ValidationError from "../Errors/ValidationError";

export class Name {

    constructor(public readonly value: string) {
        this.validate();
    }

    private validate(): void {

        if (typeof this.value !== 'string') {
            throw new ValidationError('El nombre debe de ser un string.');
        }

        if (!this.value) {
            throw new ValidationError('El nombre no puede estar vacío.');
        }

    }

}
```

**Shared/Model/NameOptional.ts**

```ts
import ValidationError from "../Errors/ValidationError";

export class NameOptional {

    constructor(public readonly value: string | null) {
        this.validate();
    }

    private validate(): void | null {

        if (!this.value) {
            return null;
        }

        if (typeof this.value !== 'string') {
            throw new ValidationError('El nombre debe de ser un string.');
        }

        if (this.value === null) {
          return;
      }
    }

}

```

Volviendo a Area:

Define una clase Area, que es una entidad de dominio es un objeto clave dentro del modelo 
de negocio de una aplicación.

```ts
export class Area {
```

## **Método estático `fromPrimitives`**
```ts
static fromPrimitives(data: AreaPrimitives): Area {
    const id = new Uuid(data.id);
    const name = new Name(data.name);
    const status = new Bool(data.status);

    return new Area(id, name, status);
}
```
 🔹 fromPrimitives() recibe datos de la BBDD en formato simple (string, boolean, number) y los convierte en objetos de valor (Uuid, Name, Bool).
🔹 Convierte un objeto "plano" (`AreaPrimitives`) en una instancia de `Area`.  

Podemos transformarlo en un objeto `Area`:
```ts
const area = Area.fromPrimitives(rawArea);
```
---


## **Constructor**
```ts
constructor(
    public readonly id: Uuid,
    public readonly name: Name,
    public readonly status: Bool,
){}
```
🔹 Define los atributos de `Area`.  
🔹 **Usa objetos de valor** (`Uuid`, `Name`, `Bool`) en lugar de tipos primitivos.  
🔹 **Los atributos son `readonly`**, lo que significa que **no pueden modificarse después de la creación**.

> **Ejemplo:**  
Creamos un área manualmente:
```ts
const area = new Area(new Uuid("123"), new Name("Finanzas"), new Bool(true));
```

---

## **Método `getPrimitives()`**
```ts
getPrimitives(): AreaPrimitives {
    return {
        id: this.id.value,
        name: this.name.value,
        status: this.status.value
    }
}
```
🔹 Convierte una instancia de `Area` en una **estructura de datos simple** (`AreaPrimitives`).  
🔹 **Se usa cuando queremos guardar un área en la base de datos**.

> **Ejemplo:**  
Si tenemos un objeto `Area`:
```ts
const area = new Area(new Uuid("123"), new Name("Marketing"), new Bool(true));
```
Podemos convertirlo en datos simples:
```ts
const areaData = area.getPrimitives();
console.log(areaData);
// { id: "123", name: "Marketing", status: true }
```

# Repository

Aquí se definen los métodos que puede hacer cada entidad en la base de datos sin definir aquí 
la implementación. Es solo una interfaz.

**Area/Repository/AreaRepository.d.ts**

```ts
import { Bool } from "../../Shared/Models/Bool";
import { Name } from "../../Shared/Models/Name";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { Uuid } from "../../Shared/Models/Uuid";
import { Area } from "../Model/Area";

export default interface AreaRepository {

    saveArea(area: Area): Promise<void>;
    getAreas(name: NameOptional, status: Bool): Promise<Area[]>;
    getAreaById(id: Uuid): Promise<Area>;
    getAreaByName(name: Name): Promise<Area | null>;
    removeArea(id: Uuid): Promise<void>;

}

```

Se escribe el nombre del método, seguido del parámetro de este y su tipo de dato, y
finalmente el tipo de dato de la respuesta, la mayoría son promesas, porque se usa la asincronía. 

Así que en resumen:

**nombreMetodo(parametro: TipoDatoDeParam): Promise<tipoDato>**

Los métodos más comunes para todo son:

- **save / create** → Guarda o crea un registro
    - normalmente recibe un objeto de la entidad y devuelve void
- **getById** → Obtiene un registro por su ID
    - recibe un ID y devuelve el objeto de la entidad
- **getAll** → Obtiene todos los registros
    - recibe params para filtrar y devuelve un array de objetos de la entidad
- **delete / remove** → Elimina un registro
    - recibe un ID y devuelve void

**dato importante**: En métodos como getAll, los parámetros son para
filtrar los datos. Y en caso de que queramos filtrarlos opcionalmente por algo,
usamos el tipo de dato de modelo opcional, como NameOptional.

# INFRAESTRUCTURA

Ahora empieza la parte más divertida, o sea, complicadita, donde se implementan esos métodos que antes
definimos en la interfaz...

```ts
import { inject, injectable } from "tsyringe";
import { LogService } from "../../Shared/Infraestructure/Services/LogService";
import { Uuid } from "../../Shared/Models/Uuid";
import { prisma } from "../../Shared/Prisma/prisma";
import { Name } from "../../Shared/Models/Name";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { v4 as uuidv4 } from 'uuid';
import { compare } from "bcrypt";
import { Bool } from "../../Shared/Models/Bool";
import AreaRepository from "../Repository/AreaRepository";
import { Area } from "../Model/Area";
import { NameOptional } from "../../Shared/Models/NameOptional";

@injectable()
export default class AreaPrismaRepository implements AreaRepository {

    constructor(
        private logService: LogService,
    ) {}

    async saveArea(area: Area): Promise<void>{
        await prisma.areas.upsert({
            where: {
                id: area.id.value
            },
            update: {
                name: area.name.value,
                status: area.status.value
            },
            create: {
                id: area.id.value,
                name: area.name.value,
                status: area.status.value
            }
        });

    };

    async getAreas(name: NameOptional, status: Bool): Promise<Area[]>{

        console.log(name.value, status.value);

        const areas = await prisma.areas.findMany({
            where: {
                AND: [
                    name.value ? {
                        OR: [
                            { name: { startsWith: name.value } },
                            { name: { endsWith: name.value } }
                        ],
                    } : {},
                    { status: { equals: status.value ? true : false } },
                ]
            }
        });

        return areas.map(area => this.createArea(area));

    }

    async getAreaById(id: Uuid): Promise<Area>{

        const area = await prisma.areas.findUnique({
            where: {
                id: id.value
            }
        });

        return this.createArea(area);

    }

    async getAreaByName(name: Name): Promise<Area | null>{

        const area = await prisma.areas.findFirst({
            where: {
                name: name.value
            }
        });

        if (!area) {
            return null;
        }

        return this.createArea(area);

    }

    async removeArea(id: Uuid): Promise<void>{
        await prisma.areas.delete({
            where: {
                id: id.value
            }
        });
    }

    private createArea(data: any): Area {
        const id = new Uuid(data.id);
        const name = new Name(data.name);
        const status = new Bool(data.status);

        return new Area(id, name, status);
    }

}
```
**Ignoremos eso de Inyectable que se explicará más adelante!**

- Al principio se crea una clase llamada AreaPrismaRepository implementa todos los métodos definidos en la interfaz AreaRepository.
AreaRepository (interfaz que define los métodos).
Si no implementa algún método, TypeScript dará un error.

- En el constructor se inyecta LogService, un archivo que importamos de Shared, que lo que hace es agregar una fecha formateada a los logs.
Esto significa que cualquier método dentro de esta clase puede usar **this.logService.log(...)** para imprimir logs con una fecha formateada.

```ts
@injectable()
export default class AreaPrismaRepository implements AreaRepository {

    constructor(
        private logService: LogService,
    ) {}
```
### Método para guardar

```ts
async saveArea(area: Area): Promise<void>{
        await prisma.areas.upsert({
            where: {
                id: area.id.value
            },
            update: {
                name: area.name.value,
                status: area.status.value
            },
            create: {
                id: area.id.value,
                name: area.name.value,
                status: area.status.value
            }
        });

    };
```
- Se crea un método asíncrono con el mismo método que pusimos en el repositorio anterior que es la interfaz de métodos(**saveArea(area: Area): Promise<void>;**) ES decir, que recibe un objeto y no devuelve nada.
- Usa prisma para realizar la operación upsert, que significa actualizar si existe, y crear si no existe.
- Aplica sobre la tabla areas para buscar ese id o el param que usemos para actualizar.

**En algunos casos se puede separar y crear un método para crear y 
otro para actualizar, pero en este caso se hace todo en uno. O a veces puede haber solo método para crear**

### Método para obtener un registro

### Por id:

```ts
 async getAreaById(id: Uuid): Promise<Area>{
        const area = await prisma.areas.findUnique({
            where: {
                id: id.value
            }
        });
        return this.createArea(area);
    }
```
- Básicamente busca un registro por id en la base de datos y devuelve un objeto de esa clase.

- Se utiliza el método findUnique para buscar un registro único, como es el id,
 solo debe existir uno. Devuelve los datos de ese registro y lo guardamos en una constante.
- Prisma devuelve un "dato crudo" desde la base de datos (un objeto plano) **createArea** 
(método definido más adelante) convierte esos datos en una entidad de dominio .

### Caso de buscar por otro campo:

```ts
   async getAreaByName(name: Name): Promise<Area | null>{
        const area = await prisma.areas.findFirst({
            where: {
                name: name.value
            }
        });
        if (!area) {
            return null;
        }
        return this.createArea(area);
    }
```

Es prácticamente lo mismo, excepto porque se usa el método **findFirst**, 
que busca el primer registro que cumpla con la condición, 
y devuelve null si no encuentra nada usando un if (!area) return null. 
 
### Método para obtener todos los registros

Este método getAreas busca áreas en la base de datos con dos posibles filtros (name o status).
Luego convierte cada resultado en un objeto Area antes de devolverlo.

```ts
   async getAreas(name: NameOptional, status: Bool): Promise<Area[]>{

        console.log(name.value, status.value);

        const areas = await prisma.areas.findMany({
            where: {
                AND: [
                    name.value ? {
                        OR: [
                            { name: { startsWith: name.value } },
                            { name: { endsWith: name.value } }
                        ],
                    } : {},
                    { status: { equals: status.value ? true : false } },
                ]
            }
        });

        return areas.map(area => this.createArea(area));

    }
```

- Utiliza un método **findMany** para buscar todos los registros que cumplan con la condición.
Y(AND:) en caso de que haya un filtro por nombre, busca que el objeto o(OR:) comience por ese nombre
o que termine por ese nombre.
Podría usarse un **contains**, pero este quizá cazaría con más registros de los deseados, pues puede tetner lo que sea delante y detrás.
Si no hay name, pues no aplica el filtro.

Como el status no es opcional, no tiene un ?, y filtra por true o false (áreas activas o no).

Por último, usando el método **map**, convierte cada resultado en un objeto Area antes de devolverlo.

### Método para eliminar un registro

```ts
async removeArea(id: Uuid): Promise<void>{
        await prisma.areas.delete({
            where: {
                id: id.value
            }
        });
    }
```
Bastante simple porque sigue el patrtón de los anteriores, 
pues se busca el registro por id y se elimina con el método **delete**.

### Método privado de creación

El método createArea es private porque solo debe ser usado dentro de la clase AreaRepository 
y no desde fuera.
📍 Recibe: Un objeto data con valores crudos (como vienen de la base de datos).
📍 Devuelve: Un objeto Area, que es una entidad de dominio.

```ts
 private createArea(data: any): Area {
        const id = new Uuid(data.id);
        const name = new Name(data.name);
        const status = new Bool(data.status);

        return new Area(id, name, status);
    }
```
**nota** EL contenido de esta función es igual que lo que hay en el método estático fromPrimitives en el modelo, 
pero por separar responsabilidades y esos rollos, se vuelve a poner aquí.


# INYECCIONES DE DEPENDENCIA

La verdad es que esto no entiendo muy bien qué hace, pero me han dicho que es necesario para que no pete. Y según palabras del chappy
tras insistir que esta fuera fácil de entender, me dice que: "Las inyecciones de dependencias (DI) sirven para que una clase reciba lo que necesita en lugar de crear esos objetos ella misma."

Y básicamente existe un fichero llamado `dependency-injection.ts` en  `Shared/Infraestructure` que contiene estas inyecciones.
En este se importan dotenv y tsyringe, que son librerías que se instalan(npm install dotenv tsyringe).
También se importan Las constantes en dependency-names.ts guardan un identificador único creado con Symbol().

```ts
export const USERS_REPOSITORY = Symbol();
export const AREAS_REPOSITORY = Symbol();

```
Y entonces el dependency-injections está:

```ts

dotenvConfig();

const userRepository = di.resolve(UserPrismaRepository)
di.register(USERS_REPOSITORY, { useValue: userRepository });

const areaRepository = di.resolve(AreaPrismaRepository)
di.register(AREAS_REPOSITORY, { useValue: areaRepository });

export { di };
```

 `const userRepository = di.resolve(UserPrismaRepository);`
→ Aquí se crea una instancia de UserPrismaRepository.

`di.register(USERS_REPOSITORY, { useValue: userRepository });`
→ Guarda userRepository en el contenedor de tsyringe, usando USERS_REPOSITORY como clave.

Y a todo esto, también se utiliza @injectable() en donde se implementan los métodos del repositorio
como se puede ver en el código de AreaPrismaRepository.ts
Se importa con `import { inject, injectable } from "tsyringe";`

@injectable() es un decorador de tsyringe (una librería de inyección de dependencias en TypeScript).
🔹 Su propósito: Permite que una clase sea inyectada automáticamente en otras clases sin necesidad de instanciarla manualmente con new.

# SERVICIOS

Son básicamente los casos de uso o lógica de negocio, y actúan de intermediarios entre el repositorio y el 
controlador.
- Llaman métodos del repositorio para leer o modificar datos en la base de datos.
Y pueden:
- Validar datos antes de guardarlos.
- Aplicar reglas de negocio (por ejemplo, que un usuario no pueda pedir más de 3 libros).
- Llamar a otros servicios (como enviar un email cuando se crea un préstamo).
- Transformar datos antes de enviarlos al controlador.

**El de creación es el que tiene Services en plural**

En el caso de Area, tiene los servicios `AreaCreateServices.ts`, `DeletetAreaService.ts`, `GetAreaService.ts`, `GetAreasService.ts`.

Vamos a analizar uno por uno.

### `AreaCreateServices.ts`

```ts
import { injectable } from 'tsyringe';
import AreaRepository from '../Repository/AreaRepository';
import { Area } from '../Model/Area';
import { Bool } from '../../Shared/Models/Bool';


@injectable()
export class AreaCreateServices {
    constructor(
        private areaRepository: AreaRepository,
    ) {}
    async execute(area: Area, newArea: Bool): Promise<void> {
        try {
            const preArea = await this.areaRepository.getAreaByName(area.name);

            if (preArea && newArea.value) {
                throw new Error('El area ya existe');
            }
            await this.areaRepository.saveArea(area);

        } catch (error: any) {
            throw new Error(error.message);
        }    
    }
}

```

1. Importtaciones

- `import { injectable } from 'tsyringe';` porque se debe utilizar también @injectable() para las dependencias.
- AreaRepository → Importa la interfaz del repositorio para interactuar con la BD.
- Area → Modelo de la entidad Area.
- Bool → Modelo de un valor booleano (true o false).


2. Inyecta dependencias y define el servicio

**(SOLO EN EL SERVICIO DE CREACIÓN SE UTILIZA @injecable())**

```ts
@injectable()
export class AreaCreateServices {
```
3. Constructor

```ts
constructor(
    private areaRepository: AreaRepository,
) {}

```
Esto nos permite usar los métodos del repositorio para interactuar con la base de datos.
El repositorio es quien realmente maneja la comunicación con la base de datos.
El servicio solo usa el repositorio para pedirle que haga cosas como guardar, obtener o eliminar datos.

4. Método principal: execute - ejecuta la lógica para crear un área

```ts
async execute(area: Area, newArea: Bool): Promise<void> {
```
- area: Area → Recibe el objeto Area con los datos del área a guardar.
- newArea: Bool → Indica si es una nueva área (true) o una actualización (false). Esto viene del controlador que veremos más adelante.
- Promise<void> → No devuelve datos, solo ejecuta acciones.

5. Verifica si el area ya existe.

```ts
const preArea = await this.areaRepository.getAreaByName(area.name);
```
Busca en la base de datos si ya existe un área con el mismo nombre.
Usa el método getAreaByName del repositorio de area.

6. Si el área existe y newArea es true, lanza un error

```ts
if (preArea && newArea.value) {
    throw new Error('El área ya existe');
}
```
Si ya existe el área y se está intentando crear una nueva (newArea = true), 
se cancela la operación lanzando un error.
newArea será true en el controlador de createAreaController por ejemplo, y false cuando sea actualizar.

7. Guardar el área en la base de datos

```ts
await this.areaRepository.saveArea(area);
```
Si el área no existe o newArea = false, se guarda en la base de datos. Usa el método saveArea
que se encuentra en el AreaRepository.

8. Manejo de errores

```ts
catch (error: any) {
    throw new Error(error.message);
}
```

Captura cualquier error y lo vuelve a lanzar para que el controlador lo maneje.

`DeleteAreaService.ts`

Este servicio se encarga de eliminar un área de la base de datos utilizando el repositorio de áreas.

```ts
import { Uuid } from "../../Shared/Models/Uuid";
import UserRepository from "../../Users/Repository/UserRepository";
import AreaRepository from "../Repository/AreaRepository";

export class DeleteAreaService {

    constructor(
        private areaRepository: AreaRepository
    ) {}

    async execute(id: Uuid): Promise<any> {
        return await this.areaRepository.removeArea(id);

    }                        
}
```
Estructura similar al anterior.
La diferencia es el execute y el método al que llama:
- Llama al método removeArea(id) del repositorio (los parámetros son los necesarios apra estte método).
- removeArea(id) es el que realmente elimina el área de la BD.
- El await espera a que la operación en la BD termine antes de continuar.


`GetAreaService.ts`

```ts
import { Uuid } from "../../Shared/Models/Uuid";
import { Area } from "../Model/Area";
import AreaRepository from "../Repository/AreaRepository";

export class GetAreaService {
    constructor(
        private areaRepository: AreaRepository,
    ) {}
    async execute(id: Uuid): Promise<Area> {

        return await this.areaRepository.getAreaById(id);
    }
}

```

Bastante sencillo, pues es como el de eliminar, pero utilizando el método 
del repositorio para obtener el área por id.
Exepto porque devuelve una instancia de la clase area,
 por lo que se debe colocar el return delante del await, y especificar
 `Promise<Area>` en el execute.

`GetAreasService.ts`

Similar al resto, pero usamos el método getAreas() del repositorio.
Por ello, debemos pasar los parámetros que necesita el método del repositorio, que son los posibles filtros. Y lo que devuelve es un Array con todas las ocurrencias de insancias de objeto.

```ts
import { Bool } from "../../Shared/Models/Bool";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { Area } from "../Model/Area";
import AreaRepository from "../Repository/AreaRepository";

export class GetAreasService {
    constructor(
        private areaRepository: AreaRepository,
    ) {}
    async execute(name: NameOptional, status: Bool): Promise<Area[]> {
        return await this.areaRepository.getAreas(name, status);
    }
}
```


# CONTROLADORES

Un controlador es la capa encargada de recibir las peticiones HTTP, validarlas, ejecutar los servicios correspondientes y devolver una respuesta al cliente.

**nota**: Un controlador no devuelve datos directamente como una función normal, sino que se envía con un response.json o send y por lo tanto ponemos Promise<void> en el método, pues quien se encarga de devolver el objeto es el servicio.

### Funciones principales de un controlador:

- Recibir y procesar la solicitud HTTP (req, res).
- Validar los datos de entrada.
- Llamar al servicio correspondiente (que interactúa con la base de datos a través del repositorio).
- Manejar errores y responder con el código HTTP adecuado.

Esquema de un controlador:

```ts
@injectable()
export class NombreDelControlador implements HttpController {
    
    constructor(
        private httpService: HttpService,
        @inject(REPOSITORIO1) private repo1: TipoRepositorio1,
        @inject(REPOSITORIO2) private repo2: TipoRepositorio2,
    ) {}

    async execute(request: Request, response: Response): Promise<void> {
        try {
            // 1️⃣ Obtener datos de la request
            const id = new Uuid(request.params.id);
            
            // 2️⃣ Validaciones o autenticación
            const authService = new AuthService(this.repo2);
            await authService.checkAccessToken(request.get("Authorization"));

            // 3️⃣ Llamar al servicio correspondiente
            const servicio = new NombreDelServicio(this.repo1);
            const resultado = await servicio.execute(id);

            // 4️⃣ Responder al cliente
            this.httpService.ok(response, resultado);
        } catch (error: any) {
            console.log(error.message);

            if (error.message === "No tiene permiso para realizar esta acción.") {
                this.httpService.unauthorized(response, error.message);
                return;
            }

            this.httpService.badRequest(response, "Error en la operación.");
        }
    }
}

```

 ### Puntos clave para todos los controladores:

🔹 1. Decorador @injectable() → Indica que esta clase puede recibir dependencias con tsyringe.

🔹 2. Inyección de dependencias → Se inyectan HttpService, UserRepository y AreaRepository.

🔹 3. execute(request, response) → Método principal que maneja la petición HTTP.

🔹 4. Extraer datos de request → Como request.body.id o request.params.id.

🔹 5. Autenticación con AuthService → Verifica si el usuario tiene permisos.

🔹 6. Llamar al servicio correspondiente → Como DeleteAreaService.

🔹 7. Manejo de errores → Si falla, responde con badRequest() o unauthorized().

No siempre hace falta comprobar el token de acceso y autorizar la acción, pero en el ejemplo
que me dieron, lo hacen en todos los controladores, tanto para listar como para eliminar, así
que vamos a hacerlo igual a su ejemplo, que es:

```ts
import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Uuid } from "../../Shared/Models/Uuid";
import { AREAS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import AreaRepository from "../Repository/AreaRepository";
import UserRepository from "../../Users/Repository/UserRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { DeleteAreaService } from "../Services/DeleteAreaService";

//Hace que los servicios y repositorios se agreguen automáticamente
@injectable()

//Implementa HttpController, lo que indica que debe tener un método execute que se encargará de recibir y procesar la solicitud HTTP.
export class DeleteAreaController implements HttpController {

    constructor(
        //httpService: Para enviar respuestas HTTP (ok, badRequest, unauthorized).
        private httpService: HttpService,
        //userRepository: Para manejar la autorización
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
        //bookRepository: Para acceder a los libros.
        @inject(AREAS_REPOSITORY) private areaRepository: AreaRepository

        //Usa @inject(USERS_REPOSITORY) y @inject(BOOKS_REPOSITORY) para que tsyringe inyecte automáticamente los repositorios correctos.
    ) {}
    
    //Método principal del controlador que recibe datos y devuelve respuesta
    async execute(request: Request, response: Response): Promise<void> {
        try {
            //optener datos, lo convierte en instancia uuid que hace que valide que sea correcto
            const id = new Uuid(request.body.id);
            //autentificar token
            //Crea una instancia del servicio de autenticación (AuthService).
            //Llama a checkAccessToken con el token de autorización del header HTTP.
            //Si el usuario no tiene permisos, lanza un error (se maneja en catch).
            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            //llamar al servicio
            //Crea una instancia del servicio DeleteBookService.
            //Llama a execute(id), que elimina el libro de la base de datos.
            //Este servicio usa el bookRepository para ejecutar la operación de eliminación.
            const deleteAreaService = new DeleteAreaService(this.areaRepository);  
            await deleteAreaService.execute(id);
            //Responde con un mensaje de éxito usando httpService(response.status(200).json('Libro eliminado correctamente'))
            this.httpService.ok(response, 'Area eliminada correctamente'); 
        
            //manejar errores
        } catch (error: any) {
            //si el error es de autorización
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            //cualquier otro error
            console.log(error.message);
            this.httpService.badRequest(response, 'Error al eliminar el usuario.');

        }
    }
}


```

**unauthorized y badRequest** son métodos de la clase HttpService, que es un servicio personalizado en este proyecto, que aún no he examinado pero lo haré mñas adelante. Pero lo que harán será devolver un httpresponse con un status.

`CreateAreaController.js`

```ts
import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { AREAS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import { Uuid } from "../../Shared/Models/Uuid";
import AreaRepository from "../Repository/AreaRepository";
import UserRepository from "../../Users/Repository/UserRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { GetAreaService } from "../Services/GetAreaService";


@injectable()
export class GetAreaController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(AREAS_REPOSITORY) private areaRepository: AreaRepository,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const id = new Uuid(request.params.id);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const getAreaService = new GetAreaService(this.areaRepository);  
            const area = await getAreaService.execute(id);
    
            this.httpService.ok(response, area ? area.getPrimitives() : null); 

        } catch (error: any) {

            console.log(error.message);
            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            
            this.httpService.badRequest(response, 'Area no encontrada.');

        }

    }
}

```

Es prácticamente igual al anterior, excepto porque utiliza un servicio distinto, GetAreaService, y devuelve un objeto pero convirtiendo antes este a los valores simplificados tipo json usando getPrimitives, el cual se encuentra en el modelo de Area:

`this.httpService.ok(response, area ? area.getPrimitives() : null);`

Si el servicio no devuelve el objeto, entonces devuelve null.

------

`GetAreasController.ts`

```ts
import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Bool } from "../../Shared/Models/Bool";
import AreaRepository from "../Repository/AreaRepository";
import { AREAS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { GetAreasService } from "../Services/GetAreasService";
import { Area } from "../Model/Area";


@injectable()
export class GetAreasController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(AREAS_REPOSITORY) private areaRepository: AreaRepository,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const name = new NameOptional(request.body.name ? request.body.name : null);
            const status = new Bool(request.body.status);
            
            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));
            
            const getAreasService = new GetAreasService(this.areaRepository);  
            const areas = await getAreasService.execute(name, status);
    
            this.httpService.ok(response, areas.map((user: Area) => user.getPrimitives())); 

        } catch (error: any) {

            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);
        }   
    }
}

```

ES similar al anterior, con algunas exceptiones.

Este controlador **permite buscar múltiples áreas** usando filtros opcionales. Es diferente porque:
- Usa `request.body.name` y `request.body.status` como filtros en lugar de un `id`.
- Convierte estos valores con `NameOptional` y `Bool`.
- Llama a un servicio que devuelve **una lista de áreas**, no solo una.
- Usa `.map()` para convertir cada `Area` a su formato de salida.

`this.httpService.ok(response, areas.map((user: Area) => user.getPrimitives()));`

----

`SaveAreaController.js`

```ts
import { inject, injectable } from "tsyringe";
import { HttpController } from "../../Shared/Infraestructure/types";
import HttpService from "../../Shared/Infraestructure/Services/HttpService";
import { Request, Response } from "express";
import { Name } from "../../Shared/Models/Name";
import { Uuid } from "../../Shared/Models/Uuid";
import { v4 as uuidv4 } from 'uuid';
import { Bool } from "../../Shared/Models/Bool";
import AreaRepository from "../Repository/AreaRepository";
import { AREAS_REPOSITORY, USERS_REPOSITORY } from "../../Shared/Infraestructure/dependency-names";
import UserRepository from "../../Users/Repository/UserRepository";
import { AuthService } from "../../Users/Services/AuthService";
import { Area } from "../Model/Area";
import { AreaCreateServices } from "../Services/AreaCreateServices";


@injectable()
export class SaveAreaController implements HttpController {

    constructor(
        private httpService: HttpService,
        @inject(AREAS_REPOSITORY) private areaRepository: AreaRepository,
        @inject(USERS_REPOSITORY) private userRepository: UserRepository,
    ) {}
    
    async execute(request: Request, response: Response): Promise<void> {
        try {

            const newArea = new Bool(request.body.id ? false : true);
            const id = new Uuid(request.body.id ? request.body.id : uuidv4());  
            const name = new Name(request.body.name);
            const status = new Bool(request.body.status ? true : false);

            const authRequestServices = new AuthService(this.userRepository);
            await authRequestServices.checkAccessToken(request.get('Authorization'));

            //Se crea el objeto
            const area = new Area(id, name, status);
            
            //si el id existe, se actualiza, si no se crea (recordad el upsert)
            const areaCreateServices = new AreaCreateServices(this.areaRepository);  
            await areaCreateServices.execute(area, newArea);
    
            this.httpService.ok(response, { message: 'Area guardada correctamente', area: area.getPrimitives()}); 

        } catch (error: any) {

            if (error.message === 'No tiene permiso para realizar esta acción.') {
                this.httpService.unauthorized(response, error.message);
            }
            this.httpService.badRequest(response, error.message);

        }

        
    }

}

```

Este es el controlador para guardar o actualizar, que utiliza los servicios que contienen los métodos en el repositorio.
En este controlador, el cuerpo de la solicitud (request.body) es más complejo, ya que se usan varios valores para crear o actualizar un área (como id, name, status)

- newArea: Un objeto de tipo Bool que indica si el área es nueva (true) o ya existe (false). Se establece según si request.body.id está presente o no.
- id: Si no se proporciona un id, se genera uno nuevo utilizando uuidv4().
- name: Se crea un objeto de tipo Name con el nombre del área que llega en el cuerpo de la solicitud.
- status: Se crea un objeto de tipo Bool con el valor de status que llega en el cuerpo de la solicitud.

```ts
const areaCreateServices = new AreaCreateServices(this.areaRepository);
await areaCreateServices.execute(area, newArea);

```

**NOTA** para usar el uuid4() hace falta descargar `npm install --save-dev @types/uuid` y realizar la importación: `import { v4 as uuidv4 } from 'uuid';`

**Llamada al servicio:** El controlador llama a un servicio, AreaCreateServices, para manejar la lógica de negocio detrás de la creación del área. 

El servicio toma el objeto Area y determina si se está creando un área nueva o actualizando una existente (según si newArea es true o false (si le llega un id o no)). Esta separación de lógica de negocio es un patrón común en aplicaciones bien estructuradas.

Es útil tener el servicio y el método del reositorio al lado para ver la relación.








-----
**nota**
.query: Para búsquedas o filtros que no son cruciales para la ruta, generalmente en solicitudes GET.
.body: Cuando envías datos complejos o creas/actualizas recursos (por ejemplo, al crear un libro en una base de datos con un POST).
.params: Cuando quieres capturar información clave de la ruta, como un ID de recurso, generalmente en solicitudes GET, PUT, DELETE.

### Más archivos random de Shared:

`Shared/Services/CreateObjectsModel.ts`

Esto básicamente convierte los datos que llegan al tipo de dato necesario. Por ejemplo, si llega un string y necesitas un objeto de tipo Name, lo convierte, pero eso está también en el modelo de cada entidad así que no entiendo para qué repetir lo mismo. Pero como estaba en el ejemplo, pues lo pongo.

Es algo así con cada entidad:

```ts
export function createArea(data: any): Area {
    const id = new Uuid(data.id);
    const name = new Name(data.name);
    const status = new Bool(data.status);

    return new Area(id, name, status);
}
```

`Shared/Infraestructure/dependency-names.ts`

Esto lo que entiendo es que crea una constante con un símbolo o código único para el repositorio de cada entidad. No sé más pero es fácil de escribir:

```ts
export const USERS_REPOSITORY = Symbol();
export const AREAS_REPOSITORY = Symbol();
//así con todas las entidades
```

`Shared/Infraestructure/dependency-names.ts`

```ts
import { injectable } from "tsyringe";

@injectable()
export class EnvService {

    getInt(name: string, defaultValue?: number): number {
        if (process.env[name]) {
            return parseInt(process.env[name]!);
        }
        if (defaultValue === undefined) {
            throw new Error(this.getRequiredErrorMessage(name));
        }
        return defaultValue;
    }

    getString(name: string, defaultValue?: string): string {
        if (name in process.env) {
            return process.env[name]!;
        }
        if (defaultValue === undefined) {
            throw new Error(this.getRequiredErrorMessage(name));
        }
        return process.env[name] ?? defaultValue;
    }

    private getRequiredErrorMessage(name: string): string {
        return `La variable de entorno ${name} es requerida.`;
    }

}

```
Lo que hace esto es:

- Acceder a variables de entorno, que son las que contienen datos importantes y delicados(process.env).
- Convertirlas a los tipos adecuados (string o int).
- Lanzar errores si faltan variables obligatorias, evitando fallos inesperados en producción.

`Shared/Services/HttpService.ts`

El propósito de esta clase es proporcionar un conjunto de métodos que permiten enviar respuestas HTTP con diferentes códigos de estado y cuerpos de respuesta.

```ts
import type { Response } from 'express';
import { injectable } from 'tsyringe';

export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_INTERNAL_SERVER_ERROR = 500;

@injectable()
export default class HttpService {

    send(httpCode: number, response: Response, body?: any) {
        response.status(httpCode);
        response.send(body);
    }

    //200 Ok
    ok(response: Response, body?: any) {
        this.send(HTTP_OK, response, body);
    }

    //201 Created
    created(response: Response, body?: any) {
        this.send(HTTP_CREATED, response, body);
    }

    //400 Bad request
    badRequest(response: Response, body?: any) {
        this.send(HTTP_BAD_REQUEST, response, body);
    }

    //401 Unauthorized
    unauthorized(response: Response, body?: any): void {
        this.send(HTTP_UNAUTHORIZED, response, body);
    }

    //404 Not found
    notFound(response: Response, body?: any) {
        this.send(HTTP_NOT_FOUND, response, body);
    }

    //409 Conflict
    conflict(response: Response, body?: any) {
        this.send(HTTP_CONFLICT, response, body);
    }

    //500 Internal server error
    internalServerError(response: Response, body?: any) {
        this.send(HTTP_INTERNAL_SERVER_ERROR, response, body);
    }

}

```

`Shared/Services/HttpServer.ts`

```ts
import express, { Application, Request, RequestHandler, Response } from "express";
import type { EndpointsMap, HttpControllerBuilder } from "./types";
import cors from 'cors';
import { di } from './dependency-injection';
import HttpService from "./Services/HttpService";
import { Server } from 'http';
import { injectable } from "tsyringe";
import { LogService } from "./Services/LogService";
import DomainError from "../Errors/DomainError";

@injectable()
export class HttpServer {

    private app: Application;
    private server: Server | undefined;

    constructor(
        private httpService: HttpService,
        private logService: LogService,
    ) {

        this.app = express();
        // Middleware para agregar el encabezado Access-Control-Allow-Origin
        // this.app.use((req, res, next) => {
        //     res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
        //     next();
        // });
    
        this.app.use(cors());
        this.app.use(express.json());
        this.app.set('trust proxy', true)
    }

    bindEndpoints(endpointsMap: EndpointsMap): void {
        for (const [endpoint, endpointHandler] of Object.entries(endpointsMap)) {
            const colon = endpoint.indexOf(':');
            const method = endpoint.substring(0, colon).trim().toLowerCase() as 'get' | 'post' | 'put' | 'delete';
            const path = endpoint.substring(colon + 1).trim();
            
            if (!['get', 'post', 'put', 'delete'].includes(method)) {
                throw new Error(`El método http "${method}" no está soportado.`);
            }

            let handlers: RequestHandler[];

            if (Array.isArray(endpointHandler)) {
                handlers = endpointHandler.map((handler, index) => {
                    if (index + 1 === endpointHandler.length) {
                        return this.controllerRunner(handler as HttpControllerBuilder);
                    }
                    return handler;
                }) as RequestHandler[];
            } else {
                handlers = [this.controllerRunner(endpointHandler)];
            }

            this.app[method](path, ...handlers);
        }
    }

    start(port: number): Promise<void> {
        return new Promise(resolve => {
            this.server = this.app.listen(port, () => {
                this.logService.log(`El servidor http está preparado en el puerto ${port}.`);
                resolve();
            });
        });
    }

    stop(): Promise<void> {
        return new Promise(resolve => {
            if (!this.server) {
                resolve();
                return;
            }
            this.server.close(() => {
                resolve();
            });
        });
        
    }

    private controllerRunner(controllerBuilder: HttpControllerBuilder): RequestHandler {
        return async (request: Request, response: Response) => {
            try {
                
                this.logService.log(`Ejecutando controlador en la ruta '${request.originalUrl}'.`);
                const controller = di.resolve(controllerBuilder);
                await controller.execute(request, response);

                // this.updateUserActiviy(request);
            
            } catch (error) {

                const err = error as Error;
                this.logService.log(err);

                /* if (err instanceof DomainError) {
                    this.domainErrorHandler.handle(err, response);
                } else {
                    this.httpService.internalServerError(response, {
                        errorMessage: err.message
                    });
                } */

            } finally {
                if (!response.writableEnded) {
                    response.end();
                }
            }
        };
    }

    /* private async updateUserActiviy(request: Request): Promise<void> {
        const userId = await this.userIdExtractor.softExtractUserId(request);
        if (!userId) {
            return;
        }
        this.userActivityLogger.updateLastActivityDate(userId)
            .then(() => {
                this.logService.log(`Actualizada la actividad del usuario ${userId.value}.`);
            })
            .catch(error => console.log(error));
    } */

}

```

El código es una clase llamada `HttpServer` que se utiliza para crear y configurar un servidor HTTP. Aquí te explico de manera simple lo que hace cada parte del código:

* **Constructor**: El constructor es la función que se ejecuta cuando se crea un objeto de la clase `HttpServer`. En este caso, el constructor recibe dos parámetros: `httpService` y `logService`. Estos parámetros son objetos que se utilizan para proporcionar servicios relacionados con HTTP y registro de eventos.
* **Middleware**: El código configura dos middleware: CORS y JSON. El middleware CORS permite que los navegadores web soliciten recursos de un servidor web que se encuentra en un dominio diferente. El middleware JSON permite que el servidor web envíe y reciba datos en formato JSON.
* **Bind Endpoints**: La función `bindEndpoints` se utiliza para asociar las rutas definidas en el mapa de endpoints con los controladores correspondientes. Los controladores son funciones que se ejecutan cuando se solicita un endpoint específico.
* **Start**: La función `start` se utiliza para iniciar el servidor HTTP en un puerto específico.
* **Stop**: La función `stop` se utiliza para detener el servidor HTTP.
* **Controller Runner**: La función `controllerRunner` se utiliza para ejecutar el controlador correspondiente a la ruta solicitada.

**Flujo de Ejecución**

Aquí te explico el flujo de ejecución del código:

1. Se crea un objeto de la clase `HttpServer` y se pasa el `httpService` y `logService` como parámetros.
2. Se configuran los middleware CORS y JSON.
3. Se definen las rutas y controladores en el mapa de endpoints.
4. Se asocian las rutas con los controladores correspondientes utilizando la función `bindEndpoints`.
5. Se inicia el servidor HTTP en un puerto específico utilizando la función `start`.
6. Cuando se solicita un endpoint específico, se ejecuta el controlador correspondiente utilizando la función `controllerRunner`.

Espero que esto te haya ayudado a entender el código de manera simple. ¡Si tienes alguna pregunta adicional, no dudes en preguntar!

`Shared/Services/types.d.ts`

```ts
import { Request, RequestHandler, Response } from "express";

export interface WsControllerBuilder {
    new(...args: any[]): WsController;
}

export interface WsController {
    execute(clientId: Uuid, messageBody: any): Promise<void>;
}

export interface WsControllerMapping  {
    [controller: string]: WsControllerBuilder;
}

export interface HttpControllerBuilder {
    new(...args: any[]): HttpController;
}

export interface HttpController {
    execute(request: Request, response: Response): Promise<void>;
}

export type EndpointHandler = HttpControllerBuilder | Array<RequestHandler | HttpControllerBuilder>;

export type EndpointsMap = {
    [endpoint: string]: EndpointHandler;
};

export type ComparationOperator = 'eq' | 'like';

export type EventHandler = (data?: any) => any;

```



Pues solo me he enterado de que este archivo es como un manual de instrucciones que define cómo se comunican las diferentes partes de un programa de computadora y ayuda a crear un servidor web.

Pero como estoy cansado pego la explicación de chappy:

El código que se proporciona es una serie de interfaces y tipos de datos que se utilizan para definir la estructura de un servidor web que utiliza WebSockets y HTTP. Aquí te explico qué hace cada parte del código:

* **WsControllerBuilder**: Es una interfaz que define un constructor para un controlador de WebSockets. Un controlador de WebSockets es una función que se ejecuta cuando se establece una conexión WebSocket con el servidor.
* **WsController**: Es una interfaz que define un controlador de WebSockets. Un controlador de WebSockets es una función que se ejecuta cuando se establece una conexión WebSocket con el servidor.
* **WsControllerMapping**: Es un tipo de datos que define un mapa de controladores de WebSockets. Un mapa de controladores de WebSockets es un objeto que asocia un controlador de WebSockets con una ruta específica.
* **HttpControllerBuilder**: Es una interfaz que define un constructor para un controlador de HTTP. Un controlador de HTTP es una función que se ejecuta cuando se solicita un recurso HTTP en el servidor.
* **HttpController**: Es una interfaz que define un controlador de HTTP. Un controlador de HTTP es una función que se ejecuta cuando se solicita un recurso HTTP en el servidor.
* **EndpointHandler**: Es un tipo de datos que define un manejador de endpoints. Un manejador de endpoints es una función que se ejecuta cuando se solicita un recurso HTTP en el servidor.
* **EndpointsMap**: Es un tipo de datos que define un mapa de endpoints. Un mapa de endpoints es un objeto que asocia un manejador de endpoints con una ruta específica.
* **ComparationOperator**: Es un tipo de datos que define un operador de comparación. Un operador de comparación es un símbolo que se utiliza para comparar dos valores.
* **EventHandler**: Es un tipo de datos que define un manejador de eventos. Un manejador de eventos es una función que se ejecuta cuando se produce un evento específico.


Importante, falta el fichero app.ts

```ts
import 'reflect-metadata';
import { HttpServer } from "./src/Shared/Infraestructure/HttpServer";
import { EnvService } from "./src/Shared/Infraestructure/Services/EnvService";
import { di } from "./src/Shared/Infraestructure/dependency-injection";
import { SaveUserController } from './src/Users/Controller/SaveUserController';
import { LoginUserController } from './src/Users/Controller/LoginUserController';
import { GetUsersController } from './src/Users/Controller/GetUsersController';
import { GetUserController } from './src/Users/Controller/GetUserController';
import { DeleteUserController } from './src/Users/Controller/DeleteUserController';
import { SaveAreaController } from './src/Areas/Controller/SaveAreaController';
import { GetAreasController } from './src/Areas/Controller/GetAreasController';
import { GetAreaController } from './src/Areas/Controller/GetAreaController';
import { DeleteAreaController } from './src/Areas/Controller/DeleteAreaController';
import { SaveIndicatorController } from './src/Indicators/Controller/SaveIndicatorController';
import { GetIndicatorsController } from './src/Indicators/Controller/GetIndicatorsController';
import { GetIndicatorController } from './src/Indicators/Controller/GetIndicatorController';
import { DeleteIndicatorsController } from './src/Indicators/Controller/DeleteIndicatorsController';
import { SaveInitiativeController } from './src/Initiatives/Controller/SaveInitiativeController';
import { GetInitiativesController } from './src/Initiatives/Controller/GetIndicatorsController';
import { GetInitiativeController } from './src/Initiatives/Controller/GetInitiativeController';
import { DeleteInitiativesController } from './src/Initiatives/Controller/DeleteInitiativesController';
import { SaveLineController } from './src/Lines/Controller/SaveLineController';
import { GetLinesController } from './src/Lines/Controller/GetLinesController';
import { GetLineController } from './src/Lines/Controller/GetLineController';
import { DeleteLinesController } from './src/Lines/Controller/DeleteLineController';
import { SavePerformanceController } from './src/Performances/Controller/SavePerformanceController';
import { GetPerformancesController } from './src/Performances/Controller/GetPerformancesController';
import { GetPerformanceController } from './src/Performances/Controller/GetPerformanceController';
import { DeletePerformancesController } from './src/Performances/Controller/DeletePerformanceController';
import { SaveRelationAreaController } from './src/RelationsAreas/Controller/SaveLineController';
import { DeleteRelationAreasController } from './src/RelationsAreas/Controller/DeleteRelationAreaController';
import { SaveRelationInitiativeController } from './src/RelationsInitiatives/Controller/SaveRelationInitiativeController';
import { DeleteRelationInitiativesController } from './src/RelationsInitiatives/Controller/DeleteRelationInitiativeController';
import { SaveRelationLineController } from './src/RelationsLines/Controller/SaveRelationLineController';
import { DeleteRelationLinesController } from './src/RelationsLines/Controller/DeleteRelationLinesController';
import { GetRolesController } from './src/Roles/Controller/GetRolesController';
import { GetValuesController } from './src/RelationsValues/Controller/GetValuesController';
import { SaveRelationsLineIndicatorController } from './src/RelationsLinesIndicator/Controller/SaveRelationLineIndicatorController';
import { DeleteRelationsLinesIndicatorsController } from './src/RelationsLinesIndicator/Controller/DeleteRelationsLinesIndicatorController';
import { SaveRelationValueController } from './src/RelationsValues/Controller/SaveRelationValueController';
import { UpdateValueOnlyController } from './src/RelationsValues/Controller/UpdateValueOnlyController';
import { DeleteRelationValuesController } from './src/RelationsValues/Controller/DeleteRelationValuesController';
import { UpdateRelationLineController } from './src/RelationsLines/Controller/UpdateRelationLineController';
import { GetUserByTokenController } from './src/Users/Controller/GetUserByTokenController';
import { GetPerformancesByYearsGroupController } from './src/Performances/Controller/GetPerformancesByYearsGroupController';

const envService = di.resolve(EnvService);
const httpServer = di.resolve(HttpServer);

const httpPort = envService.getInt('PORT');

httpServer.bindEndpoints({

    'POST:/login'            : LoginUserController,
    'POST:/create_user'      : SaveUserController,
    'POST:/get_users'        : GetUsersController,
    'GET:/get_user/:id'      : GetUserController,
    'GET:/get_user_by_token' : GetUserByTokenController,
    'POST:/delete_user'      : DeleteUserController,


    'POST:/create_area'      : SaveAreaController,
    'POST:/get_areas'        : GetAreasController,
    'GET:/get_area/:id'      : GetAreaController,
    'POST:/delete_area'      : DeleteAreaController,

    'POST:/create_indicator'        : SaveIndicatorController,
    'POST:/get_indicators'          : GetIndicatorsController,
    'GET:/get_indicator/:id'        : GetIndicatorController,
    'POST:/delete_indicator'        : DeleteIndicatorsController,

    'POST:/create_initiative'       : SaveInitiativeController,
    'POST:/get_initiatives'         : GetInitiativesController,
    'GET:/get_initiative/:id'       : GetInitiativeController,
    'POST:/delete_initiative'       : DeleteInitiativesController,

    'POST:/create_line'             : SaveLineController,
    'POST:/get_lines'               : GetLinesController,
    'GET:/get_line/:id'             : GetLineController,
    'POST:/delete_line'             : DeleteLinesController,

    'POST:/create_performance'      : SavePerformanceController,
    'POST:/get_performances'        : GetPerformancesController,
    'GET:/get_performances_years'   : GetPerformancesByYearsGroupController,
    'GET:/get_performance/:id'      : GetPerformanceController,
    'POST:/delete_performance'      : DeletePerformancesController,

    'POST:/create_relation_area'    : SaveRelationAreaController,
    'POST:/delete_relation_area'    : DeleteRelationAreasController,

    'POST:/create_relation_initiative'    : SaveRelationInitiativeController,
    'POST:/delete_relation_initiative'    : DeleteRelationInitiativesController,

    'POST:/create_relation_line'    : SaveRelationLineController,
    'POST:/update_relation_line'    : UpdateRelationLineController,
    'POST:/delete_relation_line'    : DeleteRelationLinesController,

    'POST:/create_relation_line_indicator'    : SaveRelationsLineIndicatorController,
    'POST:/delete_relation_line_indicator'    : DeleteRelationsLinesIndicatorsController,

    'POST:/get_values_lines'        : GetValuesController,
    'POST:/create_value'            : SaveRelationValueController,
    'POST:/update_value'            : UpdateValueOnlyController,
    'POST:/delete_value'            : DeleteRelationValuesController,
});

async function startServer(): Promise<void> {
    await Promise.all([
        httpServer.start(httpPort)
    ]).then(() => {
        console.log(`El servidor está listo.`);
    });
}

async function stopServer(): Promise<void> {
    console.log('Deteniendo el servidor.');
    await Promise.all([
        httpServer.stop(),
    ]);
    process.exit();
}

startServer();

process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
```

El código que se proporciona es un archivo de TypeScript que define una serie de importaciones y configuraciones para un servidor web. Aquí te explico qué hace cada parte del código:

### Importaciones

El código comienza con una serie de importaciones que traen diferentes módulos y clases de otros archivos. Estas importaciones son necesarias para que el código funcione correctamente.

- import 'reflect-metadata';: Esta importación trae un módulo que permite utilizar metadatos en el código.
- import { HttpServer } from "./src/Shared/Infraestructure/HttpServer";: Esta importación trae una clase llamada HttpServer que se utiliza para crear un servidor web.
- import { EnvService } from "./src/Shared/Infraestructure/Services/EnvService";: Esta importación trae una clase llamada EnvService que se utiliza para obtener información del entorno en el que se ejecuta el código.
- import { di } from "./src/Shared/Infraestructure/dependency-injection";: Esta importación trae un módulo que permite utilizar inyección de dependencias en el código.
Configuración del servidor

Después de las importaciones, el código configura el servidor web utilizando la clase HttpServer. La configuración incluye la definición de las rutas y los controladores que se utilizarán en el servidor.

- const httpServer = di.resolve(HttpServer);: Esta línea crea una instancia de la clase HttpServer utilizando la inyección de dependencias.
- const envService = di.resolve(EnvService);: Esta línea crea una instancia de la clase EnvService utilizando la inyección de dependencias.
- const httpPort = envService.getInt('PORT');: Esta línea obtiene el número de puerto en el que se ejecutará el servidor web.
Definición de las rutas

El código define una serie de rutas que se utilizarán en el servidor web. Cada ruta se asocia con un controlador que se ejecutará cuando se solicite la ruta.

- httpServer.bindEndpoints({ ... });: Esta línea define las rutas y los controladores que se utilizarán en el servidor web.
Iniciación del servidor

Finalmente, el código inicia el servidor web utilizando la clase HttpServer.

- async function startServer(): Promise<void> { ... }: Esta función inicia el servidor web y lo configura para que escuche solicitudes en el puerto definido.
- startServer();: Esta línea llama a la función startServer para iniciar el servidor web.