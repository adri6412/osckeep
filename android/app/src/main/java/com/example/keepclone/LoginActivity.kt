package com.example.keepclone

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.keepclone.api.KeepApi
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check if already logged in
        val prefs = getSharedPreferences("keep_prefs", Context.MODE_PRIVATE)
        if (prefs.getString("token", null) != null) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        val retrofit = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3500/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        val api = retrofit.create(KeepApi::class.java)

        setContent {
            KeepCloneTheme {
                LoginScreen(api) { token ->
                    prefs.edit().putString("token", token).apply()
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                }
            }
        }
    }
}

@Composable
fun LoginScreen(api: KeepApi, onLoginSuccess: (String) -> Unit) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }

    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("OscKeep Login", style = MaterialTheme.typography.headlineMedium, color = Color.White)
        Spacer(modifier = Modifier.height(32.dp))
        
        TextField(
            value = username,
            onValueChange = { username = it },
            placeholder = { Text("Username") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        TextField(
            value = password,
            onValueChange = { password = it },
            placeholder = { Text("Password") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))
        
        if (error.isNotEmpty()) {
            Text(error, color = Color.Red)
            Spacer(modifier = Modifier.height(16.dp))
        }

        Button(
            onClick = {
                api.login(LoginRequest(username, password)).enqueue(object : Callback<LoginResponse> {
                    override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                        if (response.isSuccessful) {
                            onLoginSuccess(response.body()?.token ?: "")
                        } else {
                            error = "Invalid credentials"
                        }
                    }
                    override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                        error = "Network error: ${t.message}"
                    }
                })
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Sign In")
        }
    }
}

data class LoginRequest(val username: String, val password: String)
data class LoginResponse(val token: String, val user: Any)
