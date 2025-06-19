import fetch from "node-fetch";

export async function handler(event, context) {
  // Obtenemos las variables de entorno
  const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
  const ASSOCIATE_TAG2 = process.env.AMAZON_ASSOCIATE_TAG2;
  // Parámetros para la búsqueda - se podría pasar desde query params (event.queryStringParameters)
  const searchTerm = event.queryStringParameters?.term || "laptop";

  // Aquí iría la lógica de autenticación y petición a la API de Amazon  
  // Por simplicidad, aquí solo simulamos una respuesta (debes usar un SDK o implementar la firma)
  
  // Ejemplo simple de respuesta:
  const response = {
    message: "Esta es una respuesta simulada de búsqueda de Amazon para: " + searchTerm,
    associateTag: ASSOCIATE_TAG,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
}