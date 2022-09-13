function addCourse() {
  const submit = document.getElementById("submit");
  const formadd = document.getElementById("formadd");
  formadd.onsubmit = (e) => {
    e.preventDefault();
    // submit.onclick = () => {
    const name = document.querySelector("input[name='name']");
    const Description = document.querySelector("input[name='description']");
    const image = document.querySelector("input[name='image']");
    const videoId = document.querySelector("input[name='videoId']");

    // const formData = new FormData();
    // formData.append("name", name.value);
    // formData.append("description", Description.value);
    // formData.append("image", image.value);

    const http = new XMLHttpRequest();
    http.open("post", "http://localhost:3000/post/add-post", true);
    http.setRequestHeader("Content-Type", "aplication/json");
    http.onreadystatechange = () => {
      if (this.readyState == 4 && this.status == 200) {
        console.log(http.responseText);
      }
    };
    const course = {
      name: name.value,
      description: Description.value,
      image: image.files,
      videoId: image.videoId,
    };

    http.send(course);
  };
}
//}
// addCourse();
