function(doc) {
  if(doc.type == "photo")
    emit(doc._id, doc);
}
