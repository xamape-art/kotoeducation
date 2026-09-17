export type Review = {
  name: string
  service?: string
  date?: string
  text: string
  reply?: string
}

export const ROVER_PROFILE_HREF =
  'https://www.rover.com/members/carla-m-koto-education-paseadora-terrassa/'

export const REVIEWS_RATING = '5.0'
export const ROVER_REVIEWS_COUNT = 22

// Reseñas reales de Rover, copiadas tal cual. De más reciente a más antigua.
const roverReviews: Review[] = [
  {
    name: 'Blanca P.',
    service: 'Paseo de perros',
    date: '07 sep. 2026',
    text: 'Carla ya nos ha ayudado varias veces con nuestro perrito y repetimos porque lo hace super bien, y esta vez igual 🙏❤️',
    reply: 'Gracias por confiar en mi una y otra vez para pasear con Arrow, siempre es un placer!',
  },
  {
    name: 'Fran',
    service: 'Visitas a domicilio',
    date: '06 sep. 2026',
    text: 'Muy responsable, amable y efectiva!!👌',
    reply: 'Muchas gracias por confiar en mi para cuidar de vuestros peques!',
  },
  {
    name: 'Neus R.',
    service: 'Visitas a domicilio',
    date: '24 ago. 2026',
    text: 'Recomiendo a Carla sin ningún tipo de duda. Es una chica super responsable y que realmente ama a los animales. Se ha ganado la confianza de mis gatos en tiempo récord y los ha mimado como si fueran suyos. Me ha mantenido informada en todo momento de cómo iban las cosas por casa, se ha fijado en todos los detalles que cualquier madre de gatos controlaría (estado del arenero, fuente de agua, quien ha comido más y quien menos, etc) Ha sido una experiencia excelente. Cuando vuelva a tener vacaciones, contacto con ella SEGURO!',
    reply: 'Muchas gracias por contar conmigo para cuidar de los peques! Ha sido un placer conoceros a todos y pasar esos ratitos con ellos estos días. Espero que coincidamos pronto!🩵🤍',
  },
  {
    name: 'Fermín L.',
    service: 'Visitas a domicilio',
    date: '09 ago. 2026',
    text: 'Carla cuidó super bien de mi gata de Kali 😻 ! Todo ha ido perfecto, puntual y atenta con nosotros, volveremos a llamarla siempre que lo necesitemos. ¡Muchas gracias por todo Carla! 🐈‍⬛',
    reply: 'Muchas gracias por contar conmigo para cuidar de Kali, espero volver a cuidar de ella en el futuro!🖤',
  },
  {
    name: 'Blanca P.',
    service: 'Paseo de perros',
    date: '27 jul. 2026',
    text: 'Con Carla todo perfecto como siempre! Nuestro perrito está muy cómodo con ella. Es muy responsable, agradable, y siempre nos manda un informe y fotos del paseo. Repetiremos!!',
    reply: 'Muchas gracias por contar conmigo de nuevo para pasear con Arrow.🏹',
  },
  {
    name: 'pamela n.',
    service: 'Cuidado a domicilio',
    date: '13 jul. 2026',
    text: 'Carla es maravillosa, repartiremos sin duda!!',
    reply: 'Muchas gracias por contar conmigo!',
  },
  {
    name: 'Blanca P.',
    service: 'Paseo de perros',
    date: '13 jul. 2026',
    text: 'Carla es una chica muy responsable, muy agradable y ha cuidado super bien de nuestro perrito, nos ha mantenido informadas en todo momento de todo, y se ha adaptado super bien. Repetiremos! :)',
    reply: 'Muchas gracias por confiar en mi para pasear con Arrow. Ha sido un placer conoceros y pasear con él. Nos vemos pronto!',
  },
  {
    name: 'pamela n.',
    service: 'Paseo de perros',
    date: '07 jul. 2026',
    text: 'Carla es maravillosa, volveremos a repetir, mil gracias!',
    reply: 'Muchas gracias por contar conmigo para pasear y cuidar de Bruno y los gatitos.',
  },
  {
    name: 'Marta A.',
    service: 'Paseo de perros',
    date: '04 jun. 2026',
    text: 'Un tracte genial i molt profesional. Els meus gossos están encantats. Molt recomendable!',
    reply: 'Moltes gràcies per comptar amb mi!',
  },
  {
    name: 'Mar N.',
    service: 'Paseo de perros',
    date: '07 may. 2026',
    text: 'Mi perrita se emociona mucho cuando se acerca la hora de salir a pasear con Carla, i vuelve contentísima. Todo genial!',
    reply: 'Muchas gracias por confiar en mi para pasear con Clara! Ha sido un placer compartir esos momentos con ella!',
  },
  {
    name: 'Antía F.',
    service: 'Visitas a domicilio',
    date: '12 abr. 2026',
    text: 'Carla vino primero a conocer a Fabita y Mongeta. Cumplió sus compromisos con puntualidad y profesionalidad. Me mantuvo informada de como estaban, fotos incluidas. Lo más importante, les dio cariño. Tanto Fabita como Mongeta estuvieron a gusto con ella. Enseguida se ganó su confianza. No se puede pedir más!',
    reply: 'Gracias por confiar en mí para cuidar de las peques, han sido muy buenas y cariñosas, espero volver a coincidir en el futuro, gracias por todo!',
  },
  {
    name: 'Silvia C.',
    service: 'Paseo de perros',
    date: '29 mar. 2026',
    text: 'Carla es encantadora, ha tratado a nuestra perra con mucho cariño. Y Maya estaba superfeliz de ircacpasear con ella. Sin duda alguna, contaremos con ella cuando tengamos otra necesidad. Muchas gracias, Carla!',
    reply: 'Muchas gracias a vosotros por confiar en mi para pasear con Maya, sois una familia increible, estaré encantada de volver a veros y pasear con Maya en el futuro!',
  },
  {
    name: 'Leonardo M.',
    service: 'Paseo de perros',
    date: '18 feb. 2026',
    text: 'Estamos super contentos, una experiencia mas que positiva!!! Carla es muy amable y profesional, nos pidió una cita antes para conocer a nuestra perrita y hacer preguntas sobre sus hábitos. El día de la reserva fue súper puntual, nos envió fotos y vídeos todo el rato y con la app nos ha marcado todos los pipi y caca que ha hecho, está genial! Nuestra Phoebe regresó muy feliz del paseo. Volveremos a contar con ella en futuras necesidades.',
    reply: 'Muchas gracias por confiar en mi para pasear con Phoebe, es una maravilla pasear con ella, espero poder compartir más ratos con ella en el futuro, encantada de haberos conocido!',
  },
  {
    name: 'Emely G.',
    service: 'Paseo de perros',
    date: '14 feb. 2026',
    text: 'Ha sido una experiencia muy buena. Desde el primer momento se notó que le gustan los animales. Mi perro estuvo súper bien cuidado y volvió feliz del paseo. Me dio mucha tranquilidad dejarlo con ella. La recomiendo totalmente.',
    reply: 'Muchas gracias por confiarme a tu peque! Tu amor por tus peques es admirable. Layon es un amor, espero poder volver a pasear con él algún día.',
  },
  {
    name: 'Cristina B.',
    service: 'Paseo de perros',
    date: '09 nov. 2025',
    text: 'RECOMENDABLE 100%. Estoy encantada con Carla! Educada, responsable, puntual, te informa en todo momento de cómo han ido los paseos y envía fotos y videos Las perritas súper contentas con ella. Sin duda volveremos a contactarle. Es difícil confiar tus mascotas a una persona que no conoces y, de verdad, que he estado muy tranquila sabiendo que estaban con ella :) muy profesional 👌',
    reply: 'Muchas gracias a ti por confiar en mi! Espero poder verlas crecer y seguir compartiendo algún paseo en el futuro.',
  },
  {
    name: 'Laura T.',
    service: 'Paseo de perros',
    date: '06 nov. 2025',
    text: 'Carla es genial. Trata genial a Astro, con mucha paciencia y conocimiento de lo que hace. En todo momento informa de cómo está mi perro y me envía fotos. Seguiremos contando con ella.',
    reply: 'Muchas gracias por confiar en mí, Astro es un cachorro genial! Espero poder volver a pasear con él en el futuro!',
  },
  {
    name: 'Miguel V.',
    service: 'Paseo de perros',
    date: '14 ago. 2025',
    text: 'Una gran profesional , puedes dejar a tu amigo peludo con ella tranquilamente.',
    reply: 'Gracias por confiarme a Max, ha sido un placer poder compartir esos ratitos de paseo con él!',
  },
  {
    name: 'Efraneis G.',
    service: 'Paseo de perros',
    date: '11 jul. 2025',
    text: 'Súper una nene muy agradable 🥰el paseo comenzó a las 14:40',
    reply: 'Gracias por la reseña! Encantada de haberte conocido tanto a ti como a Duque!',
  },
  {
    name: 'Silvia C.',
    date: '19 may. 2025',
    text: 'Carla cuidó de mis gatos 3 días y es una maravilla. Se quedó en casa con ellos y me envió fotos y videos. Estuvo con ellos todo el tiempo y se les veía muy tranquilos. Es muy amable, ordenada y ha hecho un trabajo estupendo con mis gatetes. La recomiendo 100%',
  },
  {
    name: 'Miguel Arturo S.',
    service: 'Cuidado a domicilio',
    date: '18 may. 2025',
    text: 'Carla ha cuidado estupendamente de nuestros peludos, nos ha enviado fotos, videos durante nuestra ausencia y ambos se han sentido muy cómodos con ella. Si buscas una persona que cuide de tus mascotas con el mismo amor que lo harías tú y además de manera súper profesional Carla es la indicada. Muchas gracias Carla y hasta la próxima.',
    reply: 'Gracias por confiar en mi, cuidar de Dante y CeeCee ha sido toda una experiencia! Nos vemos pronto!',
  },
  {
    name: 'Lidia S.',
    date: '10 abr. 2025',
    text: 'Conozco a Carla desde hace años y siempre que la necesito está disponible para ayudarme con mi perrita. Es una persona muy responsable que siempre se esfuerza por buscar técnicas que ayuden y se adapten mejor al perrito. Gracias a ella mi perrita está mucho más relajada durante los paseos. La verdad es que es mi persona de confianza. Me da mucha tranquilidad dejar a Ona en sus manos porque sé que la tratará como si fuera parte de su familia. Estoy muy agradecida por su ayuda y repetiremos 100%.',
  },
  {
    name: 'Teresa C.',
    date: '09 abr. 2025',
    text: 'Siempre que nos vamos de vacaciones le dejo a cargo de mi perra, Kira. Tanto ella como nosotros estamos muy contentos. Siempre podemos contar con ella cuando la necesitamos.',
  },
]

// Reseñas que ya estaban en la web antes de añadir las de Rover.
const previousReviews: Review[] = [
  {
    name: 'Laura G.',
    service: 'Max (Golden Retriever)',
    text: 'Carla es increíble con Max. Siempre puntual, cariñosa y nos manda fotos durante el paseo. ¡Totalmente recomendable!',
  },
  {
    name: 'Marc T.',
    service: 'Luna (Galgo)',
    text: 'Llevamos más de un año con Carla y no cambiaríamos por nada. Conoce perfectamente las necesidades de Luna.',
  },
  {
    name: 'Ana R.',
    service: 'Mochi (Gato)',
    text: 'Se ocupó de Mochi durante nuestras vacaciones. Casa perfecta y gato feliz. ¡La más confiable!',
  },
]

export const reviews: Review[] = [...roverReviews, ...previousReviews]
