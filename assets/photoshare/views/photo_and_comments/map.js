function(doc) {
  if(doc.type == 'photo')
    emit([doc._id, 0], doc);
  else if(doc.type == 'comment')
    emit([doc.photo, 1], doc);
};
