/*eslint-disable react/display-name, max-len */
import React from 'react'
import config from 'config:@sanity/google-maps-input?'

export default {
  name: 'geopointTest',
  type: 'document',
  title: 'Geopoint test',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title'
    },
    {
      name: 'location',
      type: 'geopoint',
      title: 'A geopoint',
      description: 'This is a geopoint field',
    }
  ],
  preview: {
    select: {
      title: 'title',
      geopoint: 'location'
    },
    prepare({title, geopoint}) {
      return {
        title: title,
        media: options => {
          if (!geopoint || !geopoint.lat || !geopoint.lng || !options || !config) {
            return false
          }
          const height = (options.dimensions && options.dimensions.height) || 100
          const width = (options.dimensions && options.dimensions.width) || 100
          const img = (
            <img
              width={width}
              height={height}
              src={`https://maps.googleapis.com/maps/api/staticmap?key=${config.apiKey}&center=${geopoint.lat},${geopoint.lng}&size=${width}x${height}&maptype=roadmap&format=png&visual_refresh=true&scale=2&zoom=11`}
              alt={title}
            />
          )
          return img
        }
      }
    }
  }
}
