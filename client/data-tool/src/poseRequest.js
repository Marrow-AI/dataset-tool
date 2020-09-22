export default async function getPoses (singleImg, numOfPeople, numOfPermutations) {
  console.log('fetching poses ', numOfPeople, numOfPermutations);

    const res = await fetch('http://52.206.213.41:22100/pose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: singleImg,
        numOfPeople,
        numOfPermutations
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