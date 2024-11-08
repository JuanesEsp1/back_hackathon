const cloudinary = require('cloudinary').v2;
const DataUriParser = require('datauri/parser');
const parser = new DataUriParser();

cloudinary.config({
    cloud_name: "dhj2mpg7o",
    api_key: "193564841565823",
    api_secret: "VRaiOJyOTCqQ1WT3JQmdzD_HheY"
});

const uploadFile = async (buffer, folder, filename) => {
    try {
        // Convertir el buffer a un Data URI usando datauri
        const datauri = parser.format('.pdf', buffer);
        
        // Subir a Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(datauri.content, {
                resource_type: "auto",
                public_id: `${folder}/${filename.split('.')[0]}`,
                format: 'pdf',
                flags: "attachment"
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return result;
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
    }
};

module.exports = uploadFile;