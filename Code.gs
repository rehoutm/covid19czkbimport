function main() {
  var docId = '1kIBuO3ex99YEFQQmLLuOR3BEneg-ICt8JJxVAJ1HOP8';
  var parts = getDocumentParts(docId);
}

function getDocumentParts(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var elements = body.getNumChildren();
  for (var i = 0; i < elements; i++) {
    var element = body.getChild(i);
    var item = processElement(element);
  }
}

function processElement(element) {
  var type = element.getType();
  switch (type) {
    case DocumentApp.ElementType.PARAGRAPH: processParagraph(element.asParagraph()); break;
  }
}

function processParagraph(paragraph) {
  var heading = paragraph.getHeading();
  Logger.log(heading);
}