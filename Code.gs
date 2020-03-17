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
  //TODO - imports parts
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
      if (currentItem == null && item.type == "L") {
        currentItem = item;
      }
      if (currentItem != null && item.type == "P") {
        currentItem.text = appendText(currentItem, item);
      }
      else if (item.type == "L") {
        if (item.listId != currentItem.listId) {
          currentItem.text = appendListItem(currentItem, item);
        }
        else {
          if (item.level == currentItem.level) {
            currentPath = currentPath.substr(0, currentPath.lastIndexOf("/"));
          }
          else if (item.level < currentItem.level) {
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
  return items;
}

function appendListItem(targetItem, sourceItem) {
  return targetItem.text + "\n" + " * " + sourceItem.text;
}

function appendText(targetItem, sourceItem) {
  return targetItem.text + "\n\n" + sourceItem.text;
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
    type: "L",
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