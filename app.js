import express, { response } from 'express';
import mongoose from 'mongoose';
import { password } from './password.js';
import path from 'path'
import {dirname} from 'path'
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


// Definir el esquema para la colección de inscripciones
const InscripcionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  });

InscripcionSchema.set('toJSON',{
  transform:(document, returnedObject)=>{
    returnedObject.id=returnedObject._id.toString(),
    delete returnedObject.__v,
    delete returnedObject['_id']
    }
})

// Aplicar el middleware para analizar los cuerpos de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos de MongoDB
const uri = `mongodb+srv://darcardebasp:${password}@cluster0.mt5qgwf.mongodb.net/test?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useUnifiedTopology: true
})
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Salir del proceso si hay un error de conexión
  });

// Definir el modelo para la colección de inscripciones
const Inscripcion = mongoose.model('Inscripcion', InscripcionSchema);

app.set('view engine', 'ejs');
// Ruta para manejar el registro de inscripciones
app.post("/register", (req, res) => {
  const { name, email, message } = req.body;
  
  // Crear una nueva instancia del modelo Inscripcion
  const nuevaInscripcion = new Inscripcion({ name, email, message });
  
  // Guardar la inscripción en la base de datos
  nuevaInscripcion.save()
    .then((datos) => {
      // Crear una nueva respuesta solo con los campos necesarios
      const inscripcionRegistrada = {
        name: datos.name,
        email: datos.email,
        message: datos.message,
        id: datos._id
      };
      const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registro Exitoso</title>
      </head>
      <body>
        <h1>¡Registro exitoso!!!!!!!!!</h1>
        <p>Nombre: ${inscripcionRegistrada.name}</p>
        <p>Email: ${inscripcionRegistrada.email}</p>
        <p>Mensaje: ${inscripcionRegistrada.message}</p>
        <p>ID de inscripción: ${inscripcionRegistrada.id}</p>
        <p>volver al formulario</p>
        <!-- Botón que permite volver al formulario -->
        <a href="/">Volver al Formulario</a><br/>
      </body>
      </html>
    `;
  
    res.send(htmlResponse);
    })
    .catch((err) => {
      console.log('ERROR')
      console.error(err);
      res.status(500).send({ message: `Error al guardar la inscripción en la base de datos: ${err.message}` });
    });
});


app.put('/todos/:id', (request, response) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    email: note.email,
    message: note.message
  }

  Inscripcion.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    })
    
})

app.delete('/todos/:id', (request, response) => {
  const { id } = request.params;

  Inscripcion.findByIdAndDelete(id)
    .then(result => {
      if (result === null) {
        return response.status(404).json({ message: 'No se encontró la inscripción.' });
      }
      response.status(200).json({ message: 'Inscripción eliminada correctamente.' });
    })
    .catch(error => {
      console.error(error);
      response.status(500).end();
    });
});


// app.get('/', (req, res) =>{
//   return res.send('<h1>BIenvenidos a mi servidor con Node.js</h1>').end()
// })

app.get('/todos', (req, res) => {
  Inscripcion.find({}).then(
    data =>{
     
      res.json(data)
    }
  )
  
  
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params;

  // Supongamos que 'Inscripcion' es el modelo que representa los datos de la inscripción en la base de datos
  Inscripcion.findById(id)
    .then(data => {
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'ID no encontrado' });
      }
    })
    .catch(() => {
      res.status(500).json({ error: 'Error en el servidor' });
    });
});




app.use(express.static(path.join(__dirname, 'src')));
app.use((req, res) =>{
  return res.status(404).end()
})

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

