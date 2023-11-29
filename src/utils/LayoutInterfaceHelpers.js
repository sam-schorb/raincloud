export const processSerializedData = (serializedData) => {
    if (serializedData && serializedData.length > 0) {
        return serializedData.map(data => {
  
            let association;
            if (data.association) {
                association = data.association;
            } else {
                association = {
                    id: data.id.split('-')[1], // Assuming id format: 'type-id'
                    type: data.id.split('-')[0] // Assuming id format: 'type-id'
                };
            }
  
            return {
                ...data,
                association
            };
        });
    }
    return [];
  }


  export const getWidgetId = (type, index) => `${type}${index + 1}`;



  