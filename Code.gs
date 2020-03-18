/*
je potreba dodelat:
- zpracovani tabulek
- zpracovani formatovani - momentalne vyresene pouze odstavec se stylem nadpisu
*/

function main() {
  var docId = '1kIBuO3ex99YEFQQmLLuOR3BEneg-ICt8JJxVAJ1HOP8';
  var parts = getDocumentParts(docId);
  importKb(parts);
}

function importKb(parts) {
  var treeRoot = buildTree(parts);
  var number = 1;
  wipeCollections();
  for (var index in treeRoot.children) {
    createCollection(treeRoot.children[index], number++);
  }
}

function importDocuments(items, collectionId, parentDocumentId) {
  var number = 1;
  for (var index in items) {
    var item = items[index];
    var documentId = createDocument(item, collectionId, parentDocumentId, number++);
    Logger.log("Document " + documentId + ": " + item.heading);
    importDocuments(item.children, collectionId, documentId);
  }
}

function createDocument(item, collectionId, parentDocumentId, number) {
  var data = {
    collectionId: collectionId,
    parentDocumentId: parentDocumentId,
    title: (number + ". " + item.heading).substring(0, 100),
    text: "# " + item.heading + "\n" + item.text,
    publish: true
  };
  var response = makeRequest("documents.create", data);
  return response.data.id;
}

function createCollection(item, number) {
  var data = {
    name: (number + ". " + item.heading).substring(0, 100)
  };
  var response = makeRequest("collections.create", data);
  var collectionId = response.data.id;
  Logger.log("Collection " + collectionId + ": " + item.heading);
  importDocuments(item.children, collectionId);
}

function wipeCollections() {
  var collections = makeRequest("collections.list", {});
  for (var index in collections.data) {
    var collection = collections.data[index];
    if (collection.name != "Welcome") {
      makeRequest("collections.delete", {id: collection.id});
    }
  }
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
  return targetItem.text + "\n" + " * " + sourceItem.heading;
}

function appendText(targetItem, sourceItem) {
  var text = sourceItem.text;
  return targetItem.text + "\n" + text;
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
    text: "",
    heading: li.getText(),
    listId: li.getListId()
  }
}

function processParagraph(paragraph) {
  var text = paragraph.getText();
  var h = paragraph.getHeading();
  switch (h) {
    case DocumentApp.ParagraphHeading.HEADING1: text = "# " + text; break;
    case DocumentApp.ParagraphHeading.HEADING2: text = "## " + text; break;
    case DocumentApp.ParagraphHeading.HEADING3: text = "### " + text; break;
    case DocumentApp.ParagraphHeading.HEADING4: text = "#### " + text; break;
    case DocumentApp.ParagraphHeading.HEADING5: text = "##### " + text; break;
    case DocumentApp.ParagraphHeading.HEADING6: text = "###### " + text; break;
  }
  return {
    type: "P",
    text: text
  }
}