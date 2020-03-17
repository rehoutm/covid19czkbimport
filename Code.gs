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
    case DocumentApp.ElementType.PARAGRAPH:
      var paragraph = element.asParagraph();
      processParagraph(paragraph);
      break;
    case DocumentApp.ElementType.LIST_ITEM:
      var li = element.asListItem();
      //list items jsou pouzivane jako nadpisy, tedy v tomto bloku bude nutne vyresit zanoreni/vynoreni v ramci finalni struktury
      processListItem(li);
    default:
      Logger.log(type);
  }
}

function processListItem(li) {
  var text = li.getText();
  var level = li.get
}

function processParagraph(paragraph) {
  var heading = paragraph.getHeading();
  var attrs = paragraph.getAttributes();
  var headingAttribute = attrs[DocumentApp.Attribute.HEADING];
  var text = paragraph.getText();
  if (text.indexOf("Příznaky") > -1) {
    Logger.log({
      text: text,
      attrs: attrs
    });
  }
  Logger.log(headingAttribute);
}