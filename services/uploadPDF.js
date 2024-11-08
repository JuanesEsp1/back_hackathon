const cloudinary = require('cloudinary').v2;

const CLOUDINARY_CLOUD_NAME = "dhj2mpg7o";
const CLOUDINARY_API_KEY = "193564841565823";
const CLOUDINARY_API_SECRET = "VRaiOJyOTCqQ1WT3JQmdzD_HheY";

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return console.log('Faltan las credenciales de Cloudinary en las variables de entorno');
}


// Configuración de Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const uploadFile = async (buffer, folder, filename) => {
    try {
        // Convertir el buffer a base64
        const base64Data = buffer.toString('base64');
        
        // Determinar el tipo de archivo
        const isImage = filename.match(/\.(jpg|jpeg|png|gif)$/i);
        const dataUri = isImage 
            ? `data:image/${filename.split('.').pop()};base64,${base64Data}`
            : `data:application/pdf;base64,${base64Data}`;

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'auto',
            public_id: filename.split('.')[0],
            folder: folder
        });

        return result;
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
    }
};

module.exports = uploadFile;