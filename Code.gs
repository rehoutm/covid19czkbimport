/*
v rychlosti pripraveno zatim jednoduche parsovani GDoc dokumentu do ploche struktury - polozky maji “cestu” slozenou ze struktury nadpisu oddelenych lomitkem - dle toho bude mozne dale pracovat
je potreba dodelat:
- zpracovani tabulek
- zpracovani formatovani
*/

function main() {
  var docId = '1kIBuO3ex99YEFQQmLLuOR3BEneg-ICt8JJxVAJ1HOP8';
  var parts = getDocumentParts(docId);
  var treeRoot = buildTree(parts);
  for (var index in treeRoot.children) {
    var number = 1;
    createCollection(treeRoot.children[index], number++);
  }
}

function importDocuments(items, collectionId, parentDocumentId) {
  for (var index in items) {
    var item = items[index];
    var documentId = createDocument(item, collectionId, parentDocumentId);
    Logger.log("Document " + documentId + ": " + item.heading);
    importDocuments(item.children, collectionId, documentId);
  }
}

function createDocument(item, collectionId, parentDocumentId) {
  var data = {
    collectionId: collectionId,
    parentDocumentId: parentDocumentId,
    title: item.heading,
    text: item.text,
    publish: true
  };
  var response = makeRequest("documents.create", data);
  return response.data.id;
}

function createCollection(item, number) {
  var data = {
    name: number + ". " + item.heading
  };
  var response = makeRequest("collections.create", data);
  var collectionId = response.data.id;
  Logger.log("Collection " + collectionId + ": " + item.heading);
  importDocuments(item.children, collectionId);
}

function makeRequest(resource, data) {
  data.token = "vJbw1heiKiZwzThhjbltf7V4xV1DouUDCBlvoT";
  var response = UrlFetchApp.fetch("https://www.getoutline.com/api/" + resource, {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  });
  var text = response.getContentText("UTF-8");
  return JSON.parse(text);
}

function buildTree(parts) {
  for (var index in parts) {
    var item = parts[index];
    if (parts[item.parent] !== undefined) {
      parts[item.parent].children.push(item);
    }
  }
  return parts["/"];
}

function getDocumentParts(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var elements = body.getNumChildren();
  var items = [];
  items["/"] = {
    children: []
  };
  var currentItem = null;
  var currentPath = "";
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
          item.parent = currentPath === "" ? "/" : currentPath;
          currentPath = currentPath + "/" + item.heading.replace("/", "").trim();
          item.path = currentPath;
          currentItem = item;
          item.children = [];
          items[item.path] = item;
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
  return targetItem.text + "\n" + sourceItem.text;
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
      Logger.log("Skipping type " + type);
  }
}

function processListItem(li) {
  return {
    type: "L",
    level: li.getNestingLevel(),
    text: "# " + li.getText() + "\n",
    heading: li.getText(),
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