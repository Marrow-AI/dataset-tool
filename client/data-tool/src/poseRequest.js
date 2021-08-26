export default async function getPoses (imageUrls, keyword, numOfPeople, numOfPermutations) {
  console.log('fetching poses ', numOfPeople, numOfPermutations);
  const res = await fetch('/poseUrl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: imageUrls,
      numOfPeople,
      numOfPermutations,
      keyword
    })
  })
  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const text = await res.text();
    throw new Error(text); 
  }
}
