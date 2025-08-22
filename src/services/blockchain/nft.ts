const fetchNftMetadata = async (uri: string): Promise<any> => {
  try {
    // Format IPFS URIs properly
    let formattedUri = uri;
    if (uri.startsWith("ipfs://")) {
      formattedUri = `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }

    console.log(`🔄 Formatted URI: ${formattedUri}`);

    const response = await fetch(formattedUri, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log(`📝 Response length: ${responseText.length} characters`);

      if (responseText.trim()) {
        const metadata = JSON.parse(responseText);
        console.log(`✅ Metadata parsed successfully:`, metadata);
        return metadata;
      } else {
        console.warn(`⚠️ Empty response from ${formattedUri}`);
        return null;
      }
    } else {
      const errorText = await response.text();
      console.warn(
        `⚠️ HTTP error ${response.status}:`,
        errorText.substring(0, 100)
      );
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching metadata from ${uri}:`, error);
    return null;
  }
};

export { fetchNftMetadata };
