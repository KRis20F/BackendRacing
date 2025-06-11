# Integración Unity Multiplayer (PUN2) + Backend

## Español

### 1. Login y autenticación con backend

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class AuthManager : MonoBehaviour
{
    public string backendUrl = "https://racing-f1-backend.fly.dev/api/auth/login";
    public string email;
    public string password;

    public IEnumerator Login(System.Action<string, int> onSuccess, System.Action<string> onError)
    {
        WWWForm form = new WWWForm();
        form.AddField("email", email);
        form.AddField("password", password);

        using (UnityWebRequest www = UnityWebRequest.Post(backendUrl, form))
        {
            yield return www.SendWebRequest();
            if (www.result == UnityWebRequest.Result.Success)
            {
                var json = www.downloadHandler.text;
                var data = JsonUtility.FromJson<LoginResponse>(json);
                PlayerPrefs.SetString("jwt", data.token);
                PlayerPrefs.SetInt("userId", data.user.id);
                onSuccess?.Invoke(data.token, data.user.id);
            }
            else
            {
                onError?.Invoke(www.error);
            }
        }
    }
}

[System.Serializable]
public class LoginResponse
{
    public string token;
    public User user;
}

[System.Serializable]
public class User
{
    public int id;
    public string username;
    public string email;
}
```

**¿Cómo usarlo?**

- Llama a `StartCoroutine(authManager.Login(...))` desde tu UI de login.
- Guarda el token y userId en PlayerPrefs para usarlos en futuras peticiones.

---

### 2. Matchmaking y emparejamiento multiplayer con PUN2

```csharp
using Photon.Pun;
using Photon.Realtime;
using UnityEngine;

public class MultiplayerManager : MonoBehaviourPunCallbacks
{
    public string userId;
    public string username;

    void Start()
    {
        userId = PlayerPrefs.GetInt("userId").ToString();
        username = PlayerPrefs.GetString("username");
        ConnectToPhoton();
    }

    public void ConnectToPhoton()
    {
        PhotonNetwork.AuthValues = new AuthenticationValues(userId);
        PhotonNetwork.NickName = username;
        PhotonNetwork.ConnectUsingSettings();
    }

    public override void OnConnectedToMaster()
    {
        PhotonNetwork.JoinRandomRoom();
    }

    public override void OnJoinRandomFailed(short returnCode, string message)
    {
        PhotonNetwork.CreateRoom(null, new RoomOptions { MaxPlayers = 2 });
    }

    public override void OnJoinedRoom()
    {
        Debug.Log("Unido a la sala. Jugadores en la sala: " + PhotonNetwork.CurrentRoom.PlayerCount);
        // Aquí puedes mostrar el menú de selección de coches y nombres
    }
}
```

---

### 3. Menú de selección y visualización de jugadores y coches

```csharp
using Photon.Pun;
using Photon.Realtime;
using UnityEngine;
using UnityEngine.UI;

public class PlayerInfoDisplay : MonoBehaviourPunCallbacks
{
    public Text player1Name;
    public Text player2Name;
    public Image player1Car;
    public Image player2Car;
    public Sprite formula1OrangeSprite;
    public Sprite porsche911BlueSprite;

    void Start()
    {
        UpdatePlayerInfo();
    }

    public void UpdatePlayerInfo()
    {
        var players = PhotonNetwork.PlayerList;
        if (players.Length > 0)
        {
            player1Name.text = players[0].NickName;
            player1Car.sprite = formula1OrangeSprite; // Puedes asignar según la selección real
        }
        if (players.Length > 1)
        {
            player2Name.text = players[1].NickName;
            player2Car.sprite = porsche911BlueSprite; // Puedes asignar según la selección real
        }
    }
}
```

- Asigna los sprites de los coches en el inspector de Unity con las imágenes que has subido.

---

### 4. Apuestas y economía

```csharp
public IEnumerator EnviarApuesta(int userId, int rivalId, float cantidad, System.Action onSuccess, System.Action<string> onError)
{
    string url = "https://racing-f1-backend.fly.dev/bet/create";
    WWWForm form = new WWWForm();
    form.AddField("userId", userId);
    form.AddField("rivalId", rivalId);
    form.AddField("cantidad", cantidad.ToString());

    UnityWebRequest www = UnityWebRequest.Post(url, form);
    www.SetRequestHeader("Authorization", "Bearer " + PlayerPrefs.GetString("jwt"));
    yield return www.SendWebRequest();

    if (www.result == UnityWebRequest.Result.Success)
        onSuccess?.Invoke();
    else
        onError?.Invoke(www.error);
}
```

- Crea el endpoint en el backend para recibir y procesar la apuesta antes de la carrera.

---

### 5. Recepción y envío de resultados de carrera

```csharp
public IEnumerator EnviarResultado(int userId, int rivalId, float tiempo, bool gano, System.Action onSuccess, System.Action<string> onError)
{
    string url = "https://racing-f1-backend.fly.dev/race/result";
    WWWForm form = new WWWForm();
    form.AddField("userId", userId);
    form.AddField("rivalId", rivalId);
    form.AddField("tiempo", tiempo.ToString());
    form.AddField("gano", gano ? "1" : "0");

    UnityWebRequest www = UnityWebRequest.Post(url, form);
    www.SetRequestHeader("Authorization", "Bearer " + PlayerPrefs.GetString("jwt"));
    yield return www.SendWebRequest();

    if (www.result == UnityWebRequest.Result.Success)
        onSuccess?.Invoke();
    else
        onError?.Invoke(www.error);
}
```

- Crea el endpoint en el backend para recibir el resultado, transferir los tokens y actualizar el ranking.

---

### 6. ¿Cómo aplicar estos scripts en tu proyecto Unity?

1. Crea un GameObject vacío en tu escena y añade los scripts como componentes.
2. Asigna los sprites de los coches en el inspector.
3. Integra los scripts con tu UI (botones de login, menú de emparejamiento, etc.).
4. Usa PlayerPrefs para guardar el token y userId tras el login.
5. Llama a los métodos de apuesta y resultado en los momentos adecuados del flujo de juego.

---

### 7. Notas importantes

- Asegúrate de que las URLs del backend sean correctas y estén accesibles desde Unity.
- Protege los endpoints del backend usando el JWT recibido en el login.
- Personaliza la lógica de selección de coches según tu flujo de juego (puedes enviar la selección al backend si lo necesitas).

---

## Italiano / Català

- Puoi chiedere esempi personalizzati o spiegazioni in italiano o catalano.
- Pots demanar exemples personalitzats o explicacions en català o italià.

---

**¿Necesitas ejemplos personalizados según tu flujo de juego? ¡Pídelo y te lo preparo!**
