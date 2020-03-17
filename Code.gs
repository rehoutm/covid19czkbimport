/*
v rychlosti pripraveno zatim jednoduche parsovani GDoc dokumentu do ploche struktury - polozky maji “cestu” slozenou ze struktury nadpisu oddelenych lomitkem - dle toho bude mozne dale pracovat
je potreba dodelat:
- samotne zpracovani textu (paragraph)
- zpracovani tabulek
- zpracovani nested listu (v dokumentu je vseho vsudy jeden, problem je, ze se musi zpracovat nejakou oklikou, protoze jako list se defaultne zpracovava struktura nadpisu)
*/



function main() {
  var docId = '1kIBuO3ex99YEFQQmLLuOR3BEneg-ICt8JJxVAJ1HOP8';
  var parts = getDocumentParts(docId);
}

function getDocumentParts(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var elements = body.getNumChildren();
  var currentItem = null;
  var currentPath = "";
  var items = [];
  //asociativni pole cesta -> item
  for (var i = 0; i < elements; i++) {
    var element = body.getChild(i);
    var item = processElement(element);
    if (item != null) {
      if (currentItem == null && item.type == "H") {
        currentItem = item;
      }
      if (item.type == "P") {
        appendText(currentItem, item);
      }
      else if (item.type == "H" && item.listId == currentItem.listId) {
        if (item.level > currentItem.level) {
          //pokracujeme
        }
        else if (item.level == currentItem.level) {
          currentPath = currentPath.substr(0, currentPath.lastIndexOf("/"));
        }
        else {
          for (var x = 0; x <= currentItem.level - item.level; x++) {
            currentPath = currentPath.substr(0, currentPath.lastIndexOf("/"));
          }
        }
        currentPath = currentPath + "/" + item.text.replace("/", "");
        items[currentPath] = currentItem = item;
      }
    }
  }
}

function appendText(targetItem, sourceItem) {
}

function processElement(element) {
  var type = element.getType();
  switch (type) {
    case DocumentApp.ElementType.PARAGRAPH:
      var paragraph = element.asParagraph();
      return processParagraph(paragraph);
    case DocumentApp.ElementType.LIST_ITEM:
      var li = element.asListItem();
      return processListItem(li);
    default:
      Logger.log(type);
  }
}

function processListItem(li) {
  return {
    type: "H",
    level: li.getNestingLevel(),
    text: li.getText(),
    listId: li.getListId()
  }
}

function processParagraph(paragraph) {
  var text = paragraph.getText();
  return {
    type: "P",
    text: text
  }
}